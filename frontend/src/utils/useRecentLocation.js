const KEY = 'hackathon_recent_locations'
const MAX = 5   // giữ tối đa 5 địa điểm gần nhất

export function getRecentLocations() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? []
  } catch {
    return []
  }
}

export function saveRecentLocation(place) {
  const existing = getRecentLocations()
  // Bỏ trùng (cùng address), thêm vào đầu, giữ tối đa MAX
  const updated = [
    place,
    ...existing.filter(p => p.address !== place.address),
  ].slice(0, MAX)
  localStorage.setItem(KEY, JSON.stringify(updated))
}