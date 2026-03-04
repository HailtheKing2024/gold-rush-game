// helper to query API
async function fetchScores() {
    const res = await fetch('/api/leaderboard');
    if (!res.ok) throw new Error('Failed to load scores');
    return res.json(); // each entry now includes id, score, name, timestamp
}

// format a single score entry with rank
function formatScore(entry, rank) {
    const date = new Date(entry.timestamp);
    return `<tr>
                <td>${rank}</td>
                <td>${entry.name}</td>
                <td>${entry.score}</td>
                <td>${date.toLocaleString()}</td>
            </tr>`;
}

// index page: leaderboard button
if (document.getElementById('leaderboardBtn')) {
    document.getElementById('leaderboardBtn').addEventListener('click', () => {
        window.location.href = 'leaderboard.html';
    });
}

// leaderboard page: display scores and handle submit
if (document.getElementById('scores-container')) {
    const container = document.getElementById('scores-container');
    const form = document.getElementById('scoreForm');
    const backBtn = document.getElementById('backBtn');

    async function refresh() {
        try {
            const scores = await fetchScores();
            if (scores.length === 0) {
                container.innerHTML = '<p>No scores yet.</p>';
                return;
            }

            // map each score to a table row with rank
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

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('nameInput').value.trim();
        const score = parseInt(document.getElementById('scoreInput').value, 10);
        if (!name || isNaN(score)) return;

        try {
            const res = await fetch('/api/leaderboard', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({name, score})
            });

            if (!res.ok) throw new Error('submit failed');

            await refresh();
            form.reset();
        } catch (err) {
            alert('Failed to send score: ' + err.message);
        }
    });

    backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    refresh();
}