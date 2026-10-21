import { listPhotoUrls } from '../../data/photos'
import { listPlaces } from '../../data/places'
import { listReviewAuthors, listVisibleReviews } from '../../data/reviews'

export async function loadOverview() {
  const [places, authors, reviews, photos] = await Promise.all([
    listPlaces(),
    listReviewAuthors(),
    listVisibleReviews(),
    listPhotoUrls(),
  ])
  const covers = new Map<string, string>()
  for (const p of photos) if (!covers.has(p.placeId)) covers.set(p.placeId, p.url)
  return { places, authors, reviews, covers }
}
