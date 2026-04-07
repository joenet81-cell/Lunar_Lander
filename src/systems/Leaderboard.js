const KEY = 'lunar_lander_scores'

export const Leaderboard = {
  saveScore(score, level) {
    const scores = this.getAll()
    const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })
    scores.push({ score, level, date })
    scores.sort((a, b) => b.score - a.score)
    localStorage.setItem(KEY, JSON.stringify(scores.slice(0, 20)))
  },

  getAll() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || []
    } catch {
      return []
    }
  },

  getBest() {
    const all = this.getAll()
    return all.length > 0 ? all[0].score : 0
  },

  clear() {
    localStorage.removeItem(KEY)
  }
}
