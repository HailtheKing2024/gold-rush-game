import { ConvexClient } from "https://esm.sh/convex@1.34.0/browser";

const convexUrl = window.CONVEX_URL || "https://fastidious-heron-446.convex.cloud";
const client = new ConvexClient(convexUrl);

// format a single score entry with rank
function formatScore(entry, rank) {
    const date = new Date(entry.timestamp);

    const color = rank === 1
        ? 'gold'
        : rank === 2
            ? 'silver'
            : rank === 3
                ? '#cd7f32' // bronze
                : '#444'; // darker gray for the rest

    return `<tr style="color:${color}">
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
    let unsubscribe = null;

    function renderScores(scores) {
        try {
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
            await client.mutation("leaderboard:updateScore", { name, score });
            form.reset();
        } catch (err) {
            alert('Failed to send score: ' + err.message);
        }
    });

    backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    unsubscribe = client.onUpdate(
        "leaderboard:getTopScores",
        {},
        (scores) => renderScores(scores),
        (err) => {
            container.innerHTML = `<p>Error loading leaderboard: ${err.message}</p>`;
        }
    );

    window.addEventListener("beforeunload", () => {
        if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
        }
        client.close();
    });
}