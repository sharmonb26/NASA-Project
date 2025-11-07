// Use this URL to fetch NASA APOD JSON data
const apodData = "https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json";

// Select DOM elements
const getImageBtn = document.getElementById('getImageBtn');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const gallery = document.getElementById('gallery');

// Modal elements
const modal = document.getElementById('imageModal');
const modalMedia = modal.querySelector('.modal-media');
const modalTitle = modal.querySelector('.modal-title');
const modalDate = modal.querySelector('.modal-date');
const modalExplanation = modal.querySelector('.modal-explanation');
const closeBtn = modal.querySelector('.close-btn');

// Simple list of "Did You Know?" space facts
const spaceFacts = [
  'The Sun is over 100 times wider than Earth.',
  'Jupiter could fit all other planets inside it.',
  'A day on Venus is longer than its year.',
  'Neutron stars can spin hundreds of times per second.',
  'Saturn’s rings are mostly ice and rock.',
  'Light from the Sun takes about 8 minutes to reach Earth.',
  'Mars has the largest volcano in the solar system (Olympus Mons).',
  'The Milky Way has over 100 billion stars.',
  'Spacesuits cost more than $10 million each.',
  'Some stars are so dense a teaspoon would weigh tons.'
];

// Show one random fact in a box above the filters
function showRandomFact() {
  // Pick a random fact from the array
  const fact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
  // Find the main container
  const container = document.querySelector('.container') || document.body;
  // Create the fact box element
  const factBox = document.createElement('div');
  factBox.id = 'factBox';
  factBox.className = 'fact-box';
  factBox.innerHTML = `<strong>Did You Know?</strong> ${fact}`;
  // Append at bottom of page content
  container.appendChild(factBox);
}

// Run after DOM is ready
document.addEventListener('DOMContentLoaded', showRandomFact);

// Add click event listener to button
getImageBtn.addEventListener('click', async () => {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    
    // Validate dates
    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }

    // Check if dates are in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (new Date(startDate) > today || new Date(endDate) > today) {
        alert('Cannot select future dates - No APOD data available yet!');
        return;
    }

    // Show a loading message immediately
    gallery.innerHTML = `<div class="loading" style="text-align:center;padding:20px;font-size:18px;">Loading images...</div>`;
        try {
            // Show a loading message
            gallery.innerHTML = `<div class="loading" style="text-align:center;padding:20px;font-size:18px;">Loading images...</div>`;

            // Fetch the APOD data
            const fetchPromise = fetch(apodData).then(res => res.json());
            const delayPromise = new Promise(resolve => setTimeout(resolve, 1200)); // 1.2 seconds

            // Wait for both to finish
            const [data] = await Promise.all([fetchPromise, delayPromise]);

            // BEGINNER DEBUGGING: Log available dates
            console.log('Available dates:', data.map(item => item.date));

            // Sort by date
            const sortedImages = data.sort((a, b) => new Date(a.date) - new Date(b.date));

            // Replace loading with gallery
            gallery.innerHTML = '';
            displayGallery(sortedImages);
        } catch (error) {
            await new Promise(resolve => setTimeout(resolve, 1200));
            console.error('Error fetching APOD data:', error);
            gallery.innerHTML = '<p style="text-align:center;">Error loading images. Please try again.</p>';
        }
});

// Close modal when clicking close button or outside
closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
};

// Helper function to create image elements
function createImageElement(item) {
    // Show image for image-type APOD
    return `<img src="${item.url}" alt="${item.title}">`;
}

// Helper function to create video elements
function createVideoElement(item) {
    // If a thumbnail is available, show it with a play overlay
    if (item.thumbnail_url) {
        return `
            <a href="${item.url}" target="_blank" class="video-thumb-link" tabindex="-1">
                <img src="${item.thumbnail_url}" alt="Video thumbnail for ${item.title}">
                <div class="play-overlay">▶</div>
            </a>
        `;
    }
    // If no thumbnail, show a clear link to the video
    return `<a href="${item.url}" target="_blank" class="video-link">View Video</a>`;
}

// Function to display gallery items
function displayGallery(items) {
    items.forEach(item => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';

        // Use correct media element for image or video
        const mediaContent = item.media_type === 'video'
            ? createVideoElement(item)
            : createImageElement(item);

        // Overlay with title and date (for on-image display)
        // Also show title and date below the image for clarity
        galleryItem.innerHTML = `
            <div class="media-container">
                ${mediaContent}
                <div class="info-overlay">
                    <span class="item-title">${item.title}</span>
                    <span class="item-date">${item.date}</span>
                </div>
            </div>
            <div class="card-info">
                <div class="card-title">${item.title}</div>
                <div class="card-date">${item.date}</div>
            </div>
        `;
        // Clicking anywhere opens modal with details
        galleryItem.addEventListener('click', () => openModal(item));
        gallery.appendChild(galleryItem);
    });
}

// Function to open modal with item details
function openModal(item) {
    modalTitle.textContent = item.title;
    modalDate.textContent = item.date;
    modalExplanation.textContent = item.explanation;

    // For videos, embed if possible, else show link
    if (item.media_type === 'video') {
        // If YouTube or embeddable, use iframe
        modalMedia.innerHTML = item.url.includes('youtube.com') || item.url.includes('embed')
            ? `<iframe src="${item.url}" frameborder="0" allowfullscreen></iframe>`
            : `<a href="${item.url}" target="_blank" style="color:#0b3d91;font-weight:bold;">View Video</a>`;
    } else {
        // For images, show HD if available
        modalMedia.innerHTML = `<img src="${item.hdurl || item.url}" alt="${item.title}">`;
    }

    modal.style.display = 'block';
}
