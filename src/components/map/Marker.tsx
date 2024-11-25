import mapboxgl from 'mapbox-gl'
import { Story } from '@/lib/types'

interface MarkerProps {
  story: Story
  isSelected?: boolean
}

export class Marker extends mapboxgl.Marker {
  constructor({ story, isSelected }: MarkerProps) {
    const element = document.createElement('div')
    element.className = 'cursor-pointer'
    element.innerHTML = `
      <div class="
        relative p-2 rounded-full
        ${isSelected ? 'bg-blue-500' : 'bg-red-500'}
        transform transition-transform hover:scale-110
      ">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="white"
          class="w-6 h-6"
        >
          <path fill-rule="evenodd" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        ${isSelected ? `
          <div class="
            absolute -top-12 left-1/2 transform -translate-x-1/2
            bg-white px-2 py-1 rounded shadow-lg text-sm whitespace-nowrap
          ">
            ${story.title}
          </div>
        ` : ''}
      </div>
    `

    element.addEventListener('click', () => {
      const event = new CustomEvent('marker-click', { detail: story })
      document.dispatchEvent(event)
    })

    super({ element })
  }
}