const patterns=[
["Hash Map / Hash Set", "Fast lookups, frequency counting, and uniqueness.", "Beginner"],
["Sliding Window", "Maintain a moving range while scanning arrays and strings.", "Beginner"],
["Two Pointers", "Use two indices to compare, partition, or converge.", "Beginner"],
["Binary Search", "Narrow a sorted search space efficiently.", "Beginner"],
["Prefix Sum", "Use cumulative totals for fast range calculations.", "Beginner"],
["String Manipulation / Parsing", "Parse, transform, and reason about strings.", "Intermediate"],
["String Matching / Pattern Search", "Find matching sequences and string patterns.", "Intermediate"],
["Stack", "Use last-in, first-out processing.", "Beginner"],
["Monotonic Stack / Queue (Specific Variants)", "Maintain a monotonic sequence for range queries.", "Intermediate"],
["Queue / Deque", "Process items in order or from either end.", "Beginner"],
["Tree DFS (Preorder / Inorder / Postorder)", "Explore tree branches using depth-first traversal.", "Intermediate"],
["Tree BFS (Level Order)", "Explore tree nodes level by level.", "Intermediate"],
["Dynamic Programming - 1D", "Reuse solutions to overlapping subproblems.", "Intermediate"],
["Recursion / Divide and Conquer", "Break problems into smaller subproblems.", "Intermediate"],
["Backtracking / Subsets / Combinations / Permutations", "Explore choices and backtrack when needed.", "Intermediate"],
["Graph DFS", "Explore graph components and paths deeply.", "Advanced"],
["Graph BFS", "Explore graph layers and shortest unweighted paths.", "Advanced"],
["Matrix / Grid Traversal", "Traverse and reason about two-dimensional grids.", "Intermediate"],
["Heap / Priority Queue", "Repeatedly retrieve the highest- or lowest-priority item.", "Intermediate"],
["Intervals (Merge / Insert / Overlap)", "Sort, merge, and reason about overlapping ranges.", "Intermediate"],
["Greedy", "Choose locally optimal steps when justified.", "Intermediate"],
["Dynamic Programming - 2D / Grid", "Build solutions across two dimensions.", "Advanced"],
["Sorting", "Order values to simplify later operations.", "Beginner"],
["Fast & Slow Pointers (Linked List)", "Use pointer speeds to detect cycles or midpoints.", "Intermediate"],
["Linked List Reversal / Manipulation", "Rewire nodes and manipulate linked lists.", "Intermediate"],
["Binary Search Tree (BST)", "Use ordered tree properties.", "Intermediate"],
["Bit Manipulation", "Use binary representations and bitwise operations.", "Intermediate"],
["Dynamic Programming - Knapsack Style", "Choose combinations under constraints.", "Advanced"],
["Design Problems", "Design data structures with required operations.", "Intermediate"],
["Topological Sort", "Order nodes subject to directed dependencies.", "Advanced"],
["Union-Find (Disjoint Set)", "Track connected components as they merge.", "Advanced"],
["Trie (Prefix Tree)", "Store words using shared prefixes.", "Intermediate"],
["Cyclic Sort", "Place values into their correct indexed positions.", "Intermediate"],
["Math / Number Theory", "Use arithmetic, divisibility, and number properties.", "Intermediate"],
["Sliding Window Maximum / Minimum (Specific Variants)", "Maintain max/min values in moving windows.", "Advanced"],
["Simulation / Array Rearrangement", "Simulate operations and rearrange arrays.", "Intermediate"],
["Two Heaps", "Combine heaps to manage ordered partitions.", "Advanced"],
["K-way Merge", "Merge multiple sorted sequences efficiently.", "Advanced"],
["Game Theory / Minimax", "Reason about optimal moves in competitive games.", "Advanced"],
["Segment Tree", "Support dynamic range queries and updates.", "Advanced"],
["Binary Indexed Tree (Fenwick Tree)", "Maintain prefix aggregates with updates.", "Advanced"]];
const problems=[];
// Parse the catalogue embedded in index.html. No fetch, CDN, or external data file is used.
(function loadEmbeddedCatalogue(){
  const catalog = document.getElementById('catalogData').textContent.trim().split(/\r?\n/);
  let currentNum = 0;
  const positions = new Map();
  const specialSlugs = {
    'Sum of Scores of Built Strings — substitute: Eventual Safe States variant: Longest Cycle in a Graph': 'longest-cycle-in-a-graph',
    'Minimax Game — substitute: Min and Max': 'find-the-most-competitive-subsequence'
  };
  const slugFor = title => {
    if (specialSlugs[title]) return specialSlugs[title];
    const substituteParts = title.split(/—\s*substitute:\s*/i);
    let sourceTitle = substituteParts.length > 1 ? substituteParts[substituteParts.length - 1] : title;
    sourceTitle = sourceTitle.replace(/\(([^)]*)\)/g, '$1').replace(/[’']/g, '');
    return sourceTitle.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };
  for (const line of catalog) {
    if (!line.trim()) continue;
    if (line.startsWith('@@')) {
      currentNum = Number(line.slice(2).split('|', 1)[0]);
      positions.set(currentNum, 0);
      continue;
    }
    const split = line.lastIndexOf('|');
    const name = line.slice(0, split).trim();
    const difficulty = line.slice(split + 1).trim();
    const pos = positions.get(currentNum) + 1;
    positions.set(currentNum, pos);
    problems.push({
      id: `p${currentNum}-${pos}`,
      name,
      difficulty,
      pattern: patterns[currentNum - 1][0],
      url: `https://leetcode.com/problems/${slugFor(name)}/`
    });
  }
  if (problems.length !== 820 || patterns.length !== 41 || [...positions.values()].some(n => n !== 20)) {
    throw new Error('Embedded catalogue integrity check failed.');
  }
})();
const DONE_KEY = 'dsa-clone-done';
const REVIEW_KEY = 'dsa-clone-daily-review';
const $ = id => document.getElementById(id);

function readJSON(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || 'null');
    return parsed ?? fallback;
  } catch (error) {
    console.warn(`Could not read ${key} from local storage.`, error);
    return fallback;
  }
}

let completed = new Set(readJSON(DONE_KEY, []));
let dailyReviewHistory = readJSON(REVIEW_KEY, {});
if (!dailyReviewHistory || typeof dailyReviewHistory !== 'object' || Array.isArray(dailyReviewHistory)) {
  dailyReviewHistory = {};
}
let selectedPattern = '';
let activeTab = 'all';

function save() {
  localStorage.setItem(DONE_KEY, JSON.stringify([...completed]));
  renderStats();
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function prettyDate(date = new Date()) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  }).format(date);
}

function storeDailyReviewHistory() {
  // Keep the current entry and a useful amount of history, without letting storage grow forever.
  const keys = Object.keys(dailyReviewHistory).sort();
  for (const oldKey of keys.slice(0, Math.max(0, keys.length - 90))) {
    delete dailyReviewHistory[oldKey];
  }
  localStorage.setItem(REVIEW_KEY, JSON.stringify(dailyReviewHistory));
}

function shuffleInPlace(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function previousReviewBefore(todayKey) {
  const previousKey = Object.keys(dailyReviewHistory)
    .filter(key => key < todayKey && Array.isArray(dailyReviewHistory[key]?.ids))
    .sort()
    .pop();
  return previousKey ? dailyReviewHistory[previousKey] : null;
}

function samePair(first, second) {
  if (!Array.isArray(first) || !Array.isArray(second) || first.length !== 2 || second.length !== 2) return false;
  return first.includes(second[0]) && first.includes(second[1]) && second.includes(first[0]) && second.includes(first[1]);
}

function ensureTodayReview() {
  const todayKey = localDateKey();
  if (dailyReviewHistory[todayKey]) return dailyReviewHistory[todayKey];

  // Only generate the day's picks from questions the user has already marked as practiced.
  const practicedIds = problems.filter(problem => completed.has(problem.id)).map(problem => problem.id);
  if (practicedIds.length === 0) return null;

  const shuffled = shuffleInPlace([...practicedIds]);
  const ids = shuffled.slice(0, 2);
  const previous = previousReviewBefore(todayKey);

  // Avoid repeating the exact pair from the last generated review day whenever the pool allows it.
  if (ids.length === 2 && practicedIds.length > 2 && previous && samePair(ids, previous.ids)) {
    const alternatives = practicedIds.filter(id => !ids.includes(id) && !previous.ids.includes(id));
    if (alternatives.length) ids[1] = alternatives[Math.floor(Math.random() * alternatives.length)];
  }

  dailyReviewHistory[todayKey] = { ids, reviewed: [], createdAt: new Date().toISOString() };
  storeDailyReviewHistory();
  return dailyReviewHistory[todayKey];
}

function renderStats() {
  $('solvedStat').innerHTML = `${completed.size} <span style="font-size:14px;color:#788194;font-weight:500">/ ${problems.length}</span>`;
  $('overallBar').style.width = Math.min(100, completed.size / Math.max(1, problems.length) * 100) + '%';

  const donePatterns = patterns.filter(pattern => {
    const patternProblems = problems.filter(problem => problem.pattern === pattern[0]);
    return patternProblems.length > 0 && patternProblems.every(problem => completed.has(problem.id));
  });

  $('patternStat').innerHTML = `${donePatterns.length} <span style="font-size:14px;color:#788194;font-weight:500">/ 41</span>`;
  $('patternBar').style.width = donePatterns.length / 41 * 100 + '%';
}

function renderDailyReview() {
  const today = new Date();
  const todayKey = localDateKey(today);
  const practicedCount = problems.filter(problem => completed.has(problem.id)).length;
  const entry = ensureTodayReview();
  $('reviewTitle').textContent = entry && entry.ids.length === 1 ? 'Revisit your first practiced problem' : 'Revisit two practiced problems';
  $('reviewDate').textContent = `${prettyDate(today)} · Same picks all day`;
  $('reviewPoolCount').textContent = `${practicedCount} practiced`;

  if (!entry || !entry.ids.length) {
    $('dailyReviewList').innerHTML = `
      <div class="review-empty">
        <div class="review-empty-icon">↻</div>
        <div><strong>Your review pool is ready when you are</strong>
          <span>Mark a problem as practiced using its Done checkbox below. Your daily picks will come only from that pool.</span>
        </div>
      </div>`;
    return;
  }

  const reviewProblems = entry.ids.map(id => problems.find(problem => problem.id === id)).filter(Boolean);
  const reviewedIds = new Set(Array.isArray(entry.reviewed) ? entry.reviewed : []);
  const reviewedCount = reviewProblems.filter(problem => reviewedIds.has(problem.id)).length;
  const label = reviewedCount === reviewProblems.length ? 'Both reviews complete' : `${reviewedCount}/${reviewProblems.length} reviewed today`;

  $('dailyReviewList').innerHTML = reviewProblems.map((problem, index) => {
    const isReviewed = reviewedIds.has(problem.id);
    return `
      <article class="review-item ${isReviewed ? 'is-reviewed' : ''}">
        <div class="review-number">0${index + 1}</div>
        <div class="review-item-main">
          <a class="review-problem" href="${problem.url}" target="_blank" rel="noreferrer">${problem.name} ↗</a>
          <div class="review-meta">${problem.difficulty} · ${problem.pattern}</div>
          <label class="review-mark">
            <input type="checkbox" ${isReviewed ? 'checked' : ''} onchange="toggleDailyReview('${problem.id}')">
            Reviewed today
          </label>
        </div>
      </article>`;
  }).join('');

  // Keep the date in the header stable and expose today's review completion without another card.
  $('reviewDate').textContent = `${prettyDate(today)} · ${label}`;
}

function toggleDailyReview(id) {
  const todayKey = localDateKey();
  const entry = ensureTodayReview();
  if (!entry || !entry.ids.includes(id)) return;
  const reviewed = new Set(Array.isArray(entry.reviewed) ? entry.reviewed : []);
  if (reviewed.has(id)) reviewed.delete(id);
  else reviewed.add(id);
  entry.reviewed = [...reviewed];
  dailyReviewHistory[todayKey] = entry;
  storeDailyReviewHistory();
  renderDailyReview();
}

function renderPatterns() {
  const query = $('searchInput').value.toLowerCase();
  const level = $('levelFilter').value;
  const progress = $('progressFilter').value;
  const list = patterns.map((pattern, index) => ({
    p: pattern,
    i: index,
    qs: problems.filter(problem => problem.pattern === pattern[0]),
    done: problems.filter(problem => problem.pattern === pattern[0] && completed.has(problem.id)).length
  })).filter(({ p, qs, done }) =>
    (!query || p[0].toLowerCase().includes(query) || p[1].toLowerCase().includes(query) || qs.some(problem => problem.name.toLowerCase().includes(query))) &&
    (level === 'all' || p[2] === level) &&
    (activeTab === 'all' || activeTab === p[2] || (activeTab === 'done' && qs.length > 0 && done === qs.length)) &&
    (progress === 'all' ||
      (progress === 'todo' && done === 0) ||
      (progress === 'started' && done > 0 && done < qs.length) ||
      (progress === 'done' && qs.length > 0 && done === qs.length))
  );

  $('patternCount').textContent = `${list.length} patterns`;
  $('patternGrid').innerHTML = list.map(({ p, i, qs, done }) => `
    <button class="pattern ${selectedPattern === p[0] ? 'selected' : ''}" data-pattern="${p[0].replaceAll('&amp;', '&')}" onclick="selectPattern(${i})">
      <div class="pattern-top">
        <div style="display:flex;gap:10px;min-width:0">
          <div class="pattern-number">${String(i + 1).padStart(2, '0')}</div>
          <div><h3>${p[0]}</h3><div class="desc">${p[1]}</div></div>
        </div>
        <span class="tag">${p[2]}</span>
      </div>
      <div class="pattern-bottom"><span>${qs.length ? `${done}/${qs.length} solved` : 'Curated pattern'}</span><span>${qs.length ? Math.round(done / qs.length * 100) : 0}%</span></div>
      <div class="mini-progress"><span style="width:${qs.length ? done / qs.length * 100 : 0}%"></span></div>
    </button>`).join('') || '<div class="empty">No patterns match your filters.</div>';
}

function renderProblems() {
  const query = $('searchInput').value.toLowerCase();
  const list = problems.filter(problem =>
    (!selectedPattern || problem.pattern === selectedPattern) &&
    (!query || problem.name.toLowerCase().includes(query) || problem.pattern.toLowerCase().includes(query))
  );
  $('problemTitle').textContent = selectedPattern || 'Start with the essentials';
  $('problemSubtitle').textContent = selectedPattern
    ? 'Practice problems mapped to this pattern.'
    : 'The full pattern-wise catalogue. Select a pattern to narrow the list.';
  $('problemCount').textContent = `${list.length} problems`;
  $('problemBody').innerHTML = list.map(problem => `
    <tr>
      <td><input class="check" type="checkbox" ${completed.has(problem.id) ? 'checked' : ''} aria-label="Mark ${problem.name} complete" onchange="toggleProblem('${problem.id}')"></td>
      <td><span class="pname" style="${completed.has(problem.id) ? 'text-decoration:line-through;color:#778091' : ''}">${problem.name}</span><span class="sub">LeetCode problem</span></td>
      <td><span class="difficulty ${problem.difficulty.toLowerCase()}">${problem.difficulty}</span></td>
      <td>${problem.pattern}</td>
      <td><a class="ext" href="${problem.url}" target="_blank" rel="noreferrer">Solve ↗</a></td>
    </tr>`).join('') || '<tr><td colspan="5" class="empty">No problems found.</td></tr>';
}

function selectPattern(index) {
  selectedPattern = selectedPattern === patterns[index][0] ? '' : patterns[index][0];
  renderPatterns();
  renderProblems();
}

function toggleProblem(id) {
  completed.has(id) ? completed.delete(id) : completed.add(id);
  save();
  renderPatterns();
  renderProblems();
  renderDailyReview();
  $('toast').textContent = completed.has(id) ? 'Added to your practiced pool' : 'Practice progress updated';
  $('toast').classList.add('show');
  setTimeout(() => $('toast').classList.remove('show'), 1300);
}

$('searchInput').addEventListener('input', () => { renderPatterns(); renderProblems(); });
$('levelFilter').addEventListener('change', renderPatterns);
$('progressFilter').addEventListener('change', renderPatterns);
$('tabs').addEventListener('click', event => {
  const button = event.target.closest('button[data-tab]');
  if (!button) return;
  activeTab = button.dataset.tab;
  document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab === button));
  renderPatterns();
});
$('showProblemsBtn').onclick = () => $('problemsSection').scrollIntoView({ behavior: 'smooth' });
$('continueBtn').onclick = () => {
  const nextProblem = problems.find(problem => !completed.has(problem.id));
  if (nextProblem) {
    selectedPattern = nextProblem.pattern;
    renderPatterns();
    renderProblems();
    $('problemsSection').scrollIntoView({ behavior: 'smooth' });
  } else {
    $('toast').textContent = 'You completed all loaded problems!';
    $('toast').classList.add('show');
    setTimeout(() => $('toast').classList.remove('show'), 1500);
  }
};
$('resetBtn').onclick = () => {
  if (confirm('Reset all locally saved progress, including daily review history?')) {
    completed.clear();
    dailyReviewHistory = {};
    localStorage.removeItem(REVIEW_KEY);
    save();
    renderPatterns();
    renderProblems();
    renderDailyReview();
  }
};
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    $('searchInput').focus();
  }
  if (event.key === 'Escape') {
    $('searchInput').value = '';
    selectedPattern = '';
    renderPatterns();
    renderProblems();
  }
});

renderStats();
renderPatterns();
renderProblems();
renderDailyReview();