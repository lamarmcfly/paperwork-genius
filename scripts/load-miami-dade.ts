/**
 * Miami-Dade County Permit Data Loader
 *
 * This script fetches all building permits from the Miami-Dade County
 * ArcGIS REST API and loads them into Supabase.
 *
 * Run with: npm run load-data
 *
 * Requirements:
 * - SUPABASE_URL environment variable
 * - SUPABASE_SERVICE_ROLE_KEY environment variable (NOT the anon key)
 */

import { createClient } from '@supabase/supabase-js'

// Configuration
const ARCGIS_URL = 'https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/arcgis/rest/services/Building_Permit/FeatureServer/0/query'
const PAGE_SIZE = 2000
const BATCH_SIZE = 500 // Records per Supabase upsert

// Permit type classification
function classifyPermitType(description: string): string {
  const desc = (description || '').toLowerCase()

  if (desc.match(/demol/)) return 'demolition'
  if (desc.match(/new\s*(construction|building|dwelling|residen)/)) return 'new_construction'
  if (desc.match(/multi\s*family|apartment|condo|townhome/)) return 'multifamily'
  if (desc.match(/commercial|tenant\s*build|retail|office\s*build/)) return 'commercial_buildout'
  if (desc.match(/renovation|remodel|alteration|addition|rehab/)) return 'major_renovation'
  return 'other'
}

// Normalize ArcGIS feature to our schema
interface ArcGISFeature {
  properties: Record<string, unknown>
  geometry: { coordinates: [number, number] }
}

interface NormalizedPermit {
  source: string
  source_id: string
  address: string
  city: string
  county: string
  state: string
  zip_code: string | null
  latitude: number
  longitude: number
  permit_type: string
  permit_number: string | null
  description: string | null
  project_value: number | null
  filing_date: string | null
  issue_date: string | null
  status: string | null
  contractor_name: string | null
  raw_data: Record<string, unknown>
}

function normalizeFeature(feature: ArcGISFeature): NormalizedPermit {
  const p = feature.properties
  const coords = feature.geometry.coordinates

  return {
    source: 'miami_dade_arcgis',
    source_id: String(p.OBJECTID || p.FID),
    address: String(p.SITE_ADDR || p.ADDRESS || 'Unknown'),
    city: String(p.CITY || 'Unincorporated Miami-Dade'),
    county: 'Miami-Dade',
    state: 'FL',
    zip_code: p.ZIP ? String(p.ZIP) : null,
    latitude: coords[1],
    longitude: coords[0],
    permit_type: classifyPermitType(String(p.DESCRIPTION || '')),
    permit_number: p.PERMIT_NUM ? String(p.PERMIT_NUM) : (p.PROCESS_NUM ? String(p.PROCESS_NUM) : null),
    description: p.DESCRIPTION ? String(p.DESCRIPTION) : null,
    project_value: typeof p.EST_VALUE === 'number' ? p.EST_VALUE : (parseFloat(String(p.EST_VALUE)) || null),
    filing_date: p.FILED_DATE ? new Date(p.FILED_DATE as number).toISOString() : null,
    issue_date: p.ISSUE_DATE ? new Date(p.ISSUE_DATE as number).toISOString() : null,
    status: p.STATUS ? String(p.STATUS) : null,
    contractor_name: p.CONTRACTOR ? String(p.CONTRACTOR) : null,
    raw_data: p as Record<string, unknown>,
  }
}

// Fetch a page of data from ArcGIS
async function fetchPage(offset: number): Promise<{ features: ArcGISFeature[], hasMore: boolean }> {
  const params = new URLSearchParams({
    where: '1=1',
    outFields: '*',
    returnGeometry: 'true',
    outSR: '4326',
    f: 'geojson',
    resultRecordCount: String(PAGE_SIZE),
    resultOffset: String(offset),
    orderByFields: 'OBJECTID ASC',
  })

  const response = await fetch(`${ARCGIS_URL}?${params}`)

  if (!response.ok) {
    throw new Error(`ArcGIS API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const features = data.features || []

  return {
    features,
    hasMore: features.length === PAGE_SIZE,
  }
}

// Upsert records to Supabase in batches
async function upsertBatch(
  supabase: ReturnType<typeof createClient>,
  records: NormalizedPermit[]
): Promise<void> {
  const { error } = await supabase
    .from('permits')
    .upsert(records, {
      onConflict: 'source,source_id',
      ignoreDuplicates: false,
    })

  if (error) {
    throw new Error(`Supabase upsert error: ${error.message}`)
  }
}

// Main data loading function
async function loadAllPermits() {
  console.log('Starting Miami-Dade County permit data load...\n')

  // Initialize Supabase client with service role key
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('ERROR: Missing environment variables')
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    console.error('\nTo run in test mode (dry run), use: DRY_RUN=true npm run load-data')

    if (process.env.DRY_RUN === 'true') {
      console.log('\n--- DRY RUN MODE ---\n')
    } else {
      process.exit(1)
    }
  }

  const supabase = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null

  let offset = 0
  let totalLoaded = 0
  let totalProcessed = 0
  const startTime = Date.now()

  // Collect records for batch processing
  const pendingRecords: NormalizedPermit[] = []

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      console.log(`Fetching records starting at offset ${offset}...`)
      const { features, hasMore } = await fetchPage(offset)

      if (features.length === 0) {
        console.log('No more records to fetch.')
        break
      }

      // Normalize features
      const normalized = features
        .filter((f: ArcGISFeature) => f.geometry?.coordinates)
        .map(normalizeFeature)

      pendingRecords.push(...normalized)
      totalProcessed += features.length

      // Upsert when batch is full
      while (pendingRecords.length >= BATCH_SIZE) {
        const batch = pendingRecords.splice(0, BATCH_SIZE)

        if (supabase) {
          await upsertBatch(supabase, batch)
          totalLoaded += batch.length
          console.log(`  Upserted ${totalLoaded} records to Supabase`)
        } else {
          totalLoaded += batch.length
          console.log(`  [DRY RUN] Would upsert ${totalLoaded} records`)
        }
      }

      if (!hasMore) {
        console.log('Reached end of data.')
        break
      }

      offset += PAGE_SIZE

      // Small delay to be nice to the API
      await new Promise((resolve) => setTimeout(resolve, 100))

    } catch (error) {
      console.error(`Error at offset ${offset}:`, error)
      throw error
    }
  }

  // Upsert remaining records
  if (pendingRecords.length > 0) {
    if (supabase) {
      await upsertBatch(supabase, pendingRecords)
      totalLoaded += pendingRecords.length
      console.log(`  Upserted final ${pendingRecords.length} records`)
    } else {
      totalLoaded += pendingRecords.length
      console.log(`  [DRY RUN] Would upsert final ${pendingRecords.length} records`)
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

  console.log('\n========================================')
  console.log('Data load complete!')
  console.log(`  Total records processed: ${totalProcessed.toLocaleString()}`)
  console.log(`  Total records loaded: ${totalLoaded.toLocaleString()}`)
  console.log(`  Time elapsed: ${elapsed} seconds`)
  console.log('========================================\n')
}

// Run the script
loadAllPermits().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
