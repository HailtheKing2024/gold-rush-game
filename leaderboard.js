// leaderboard.js

// Fetch leaderboard data from backend
async function fetchScores() {
    const res = await fetch('/api/leaderboard');
    if (!res.ok) throw new Error('Failed to load scores');
    return res.json(); // entries include id, name, score, timestamp
}

// Format a single leaderboard row with rank and colored ranks
function formatScore(entry, rank) {
    const date = entry.timestamp ? new Date(entry.timestamp) : new Date();

    let color = '';
    if (rank === 1) color = 'gold';
    else if (rank === 2) color = 'silver';
    else if (rank === 3) color = '#cd7f32'; // bronze
    else color = '#444';

    return `<tr style="color:${color}">
                <td>${rank}</td>
                <td>${entry.name}</td>
                <td>${entry.score}</td>
                <td>${date.toLocaleString()}</td>
            </tr>`;
}

// Render the leaderboard table
async function renderLeaderboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const scores = await fetchScores();
        if (scores.length === 0) {
            container.innerHTML = '<p>No scores yet.</p>';
            return;
        }

        const rows = scores.map((entry, index) => formatScore(entry, index + 1)).join('');

        container.innerHTML = `<table>
                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>Name</th>
                                            <th>Score</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>${rows}</tbody>
                                </table>`;
    } catch (err) {
        container.innerHTML = `<p>Error loading leaderboard: ${err.message}</p>`;
    }
}

// Handle score submission
function setupScoreForm(formId, containerId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameInput = form.querySelector('input[name="name"]');
        const scoreInput = form.querySelector('input[name="score"]');

        const name = nameInput.value.trim();
        const score = parseInt(scoreInput.value, 10);
        if (!name || isNaN(score)) return;

        try {
            const res = await fetch('/api/leaderboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, score })
            });

            if (!res.ok) throw new Error('Failed to submit score');

            await renderLeaderboard(containerId);
            form.reset();
        } catch (err) {
            alert('Failed to send score: ' + err.message);
        }
    });
}

// Setup back button navigation
function setupBackButton(buttonId, targetUrl = 'index.html') {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    btn.addEventListener('click', () => window.location.href = targetUrl);
}

// Initialize leaderboard page
function initLeaderboard({ containerId, formId, backBtnId }) {
    renderLeaderboard(containerId);
    setupScoreForm(formId, containerId);
    setupBackButton(backBtnId);
}

// Export functions (if using modules)
export { initLeaderboard, renderLeaderboard, setupScoreForm, setupBackButton };