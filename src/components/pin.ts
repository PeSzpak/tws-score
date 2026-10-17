import L from 'leaflet'

export const pinIcon = L.divIcon({
  className: 'tws-pin',
  html: '<span></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -12],
})
