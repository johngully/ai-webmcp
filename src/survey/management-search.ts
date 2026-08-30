import { surveyFiltersSchema } from './survey.schemas'

export interface ManagementSearch {
  name?: string
  talk?: string
  ratingMin?: string | number
  ratingMax?: string | number
}

export function managementSearch(
  input: Record<string, unknown>,
): ManagementSearch {
  const search: ManagementSearch = {}
  for (const key of ['name', 'talk', 'ratingMin', 'ratingMax'] as const) {
    const value = input[key]
    if (value !== undefined && String(value).trim()) {
      const text = String(value).trim()
      if (key === 'ratingMin' || key === 'ratingMax') {
        search[key] = Number.isFinite(Number(text)) ? Number(text) : text
      } else search[key] = text
    }
  }
  return search
}

export function managementFilters(search: ManagementSearch) {
  return surveyFiltersSchema.safeParse({
    name: search.name,
    talk: search.talk,
    minRating:
      search.ratingMin === undefined ? undefined : Number(search.ratingMin),
    maxRating:
      search.ratingMax === undefined ? undefined : Number(search.ratingMax),
  })
}
