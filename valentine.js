const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
// Defines audio tracks
const track1 = new Audio('Music/Olamide-Julie-1-(JustNaija.com).mp3');
const track2 = new Audio('Music/Olamide-Melo-Melo.mp3');
let currentTrack = null;

// Configure sequential playback
track1.addEventListener('ended', () => {
    track2.currentTime = 0;
    track2.play().catch(e => console.log('Audio play error:', e));
    currentTrack = track2;
});

track2.addEventListener('ended', () => {
    track1.currentTime = 0;
    track1.play().catch(e => console.log('Audio play error:', e));
    currentTrack = track1;
});

const mainContainer = document.getElementById('mainContainer');
const intermediate = document.getElementById('intermediate');
const memoriesPage = document.getElementById('memories');

// IMPROVED NO BUTTON: Moves around the page randomly
// IMPROVED NO BUTTON: Moves to specific "safe zones" around the content
const moveNo = () => {
    // Get coordinates of key elements
    const picRect = document.querySelector('.profile-frame').getBoundingClientRect();
    const yesRect = yesBtn.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    const margin = 20;

    // Define potential positions (fixed coordinates)
    const positions = [
        // 1. Left of the picture
        {
            left: picRect.left - btnRect.width - margin,
            top: picRect.top + (picRect.height / 2) - (btnRect.height / 2)
        },
        // 2. Right of the picture
        {
            left: picRect.right + margin,
            top: picRect.top + (picRect.height / 2) - (btnRect.height / 2)
        },
        // 3. Under the Yes button
        {
            left: yesRect.left + (yesRect.width / 2) - (btnRect.width / 2),
            top: yesRect.bottom + margin
        }
    ];

    // Filter positions to ensure they stay within the viewport
    const validPositions = positions.filter(pos => {
        return (
            pos.left >= 10 &&
            pos.top >= 10 &&
            pos.left + btnRect.width <= window.innerWidth - 10 &&
            pos.top + btnRect.height <= window.innerHeight - 10
        );
    });

    // Fallback to random screen if no specific zones fit (e.g. mobile)
    let target;
    if (validPositions.length > 0) {
        // Pick a random valid position
        // Try not to pick the exact same spot if possible (simple random is usually enough)
        target = validPositions[Math.floor(Math.random() * validPositions.length)];
    } else {
        const maxX = window.innerWidth - noBtn.offsetWidth - margin;
        const maxY = window.innerHeight - noBtn.offsetHeight - margin;
        target = {
            left: Math.max(margin, Math.floor(Math.random() * maxX)),
            top: Math.max(margin, Math.floor(Math.random() * maxY))
        };
    }

    // Apply new position
    noBtn.style.position = 'fixed';
    noBtn.style.left = `${target.left}px`;
    noBtn.style.top = `${target.top}px`;
    noBtn.style.width = 'auto'; // allow natural width
    noBtn.style.minWidth = '120px'; // ensure clickable size
};

noBtn.addEventListener('mouseover', moveNo);
noBtn.addEventListener('touchstart', (e) => {
    // e.preventDefault(); // removed to ensure clicks can register if user is fast enough (optional)
    moveNo();
});

// REFINED TRANSITION
yesBtn.addEventListener('click', () => {
    // START MUSIC: Play Track 1
    track1.play().catch(e => console.log('Audio play error:', e));
    currentTrack = track1;

    // 1. Hide the question
    mainContainer.style.opacity = '0';
    setTimeout(() => {
        mainContainer.style.display = 'none';

        // 2. Show intermediate message
        intermediate.style.display = 'block';
        setTimeout(() => { intermediate.style.opacity = '1'; }, 100);

        // 3. After 3 seconds, show the final memories
        setTimeout(() => {
            intermediate.style.opacity = '0';
            setTimeout(() => {
                intermediate.style.display = 'none';
                memoriesPage.style.display = 'block';
                document.body.style.overflow = 'auto';

                // SWITCH MUSIC: Stop Track 1, Start Track 2
                track1.pause();
                track1.currentTime = 0;
                track2.play().catch(e => console.log('Audio play error:', e));
                currentTrack = track2;

                // START TYPEWRITER
                startTypewriter();

            }, 1000);
        }, 3000);
    }, 800);
});

// TYPEWRITER EFFECT
const messageElement = document.querySelector('.marriage-intent p');
const originalText = messageElement.innerHTML.trim(); // Keep HTML tags/structure?
// For typewriter, it's safer to strip tags or handle them carefully. 
// Given the current text "My name is <strong>Benedict</strong>...", simple text content is easier.
// Let's use textContent for the type effect to avoid breaking HTML tags mid-type.
// OR: We pre-format the text in JS to include the bolding manually.
// Let's stick to textContent for the animation to look clean.
const textToType = "My name is Benedict, and loving you has been the greatest journey of my life. This isn't just about a day; it's about a lifetime. I can't wait for the day I finally get to marry you.";

// Clear content initially? No, we clear it right before typing starts in the transition.
// But valid HTML is needed. Let's clear it now and store it.
messageElement.innerHTML = '<span id="typed-text"></span><span class="typewriter-cursor"></span>';

function startTypewriter() {
    const typedTextSpan = document.getElementById('typed-text');
    let i = 0;
    const speed = 50; // ms per char

    function type() {
        if (i < textToType.length) {
            typedTextSpan.textContent += textToType.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            // Remove cursor after done? Optional.
            document.querySelector('.typewriter-cursor').style.display = 'none';
            // Restore bolding manually if needed? 
            // The original had "My name is <strong>Benedict</strong>".
            // It's hard to type HTML. Let's just bold "Benedict" after typing is done.
            typedTextSpan.innerHTML = typedTextSpan.innerHTML.replace('Benedict', '<strong>Benedict</strong>');
        }
    }
    type();
}

// LIGHTBOX LOGIC
// 1. Create Overlay Elements dynamically or use existing if added to HTML (easier to add to HTML dynamically)
const lightboxOverlay = document.createElement('div');
lightboxOverlay.className = 'lightbox-overlay';
lightboxOverlay.innerHTML = `
    <span class="lightbox-close">&times;</span>
    <img class="lightbox-img" src="" alt="Full Size Memory">
`;
document.body.appendChild(lightboxOverlay);

const lightboxImg = lightboxOverlay.querySelector('.lightbox-img');
const lightboxClose = lightboxOverlay.querySelector('.lightbox-close');

// 2. Add click events to images
document.querySelectorAll('.photo-card img').forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightboxOverlay.classList.add('active');
    });
});

// 3. Close events
lightboxClose.addEventListener('click', () => {
    lightboxOverlay.classList.remove('active');
});

lightboxOverlay.addEventListener('click', (e) => {
    if (e.target === lightboxOverlay) {
        lightboxOverlay.classList.remove('active');
    }
});
