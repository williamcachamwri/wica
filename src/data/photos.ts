import type { Photo } from '../types'

const basePhotos: Photo[] = [
  { src: 'https://placehold.co/180x180/f3f4f6/374151?text=☕', caption: 'Morning coffee', rotate: -6 },
  { src: 'https://placehold.co/180x180/e5e7eb/374151?text=🌿', caption: 'Desk plant', rotate: 4 },
  { src: 'https://placehold.co/180x180/dbeafe/374151?text=💻', caption: 'Late night build', rotate: -3 },
  { src: 'https://placehold.co/180x180/fde68a/374151?text=🐈', caption: 'Office buddy', rotate: 5 },
  { src: 'https://placehold.co/180x180/fce7f3/374151?text=📖', caption: 'Sunday read', rotate: -2 },
]

export const photos: Photo[] = [...basePhotos, ...basePhotos]
/* 4a4bde63 */
