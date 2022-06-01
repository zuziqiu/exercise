var childProcess = require('child_process')
const getBranch = childProcess.execSync(`git rev-parse --symbolic-full-name --abbrev-ref @{u}`, { 'encoding': 'utf8' }).replace(/\n|\s/, '')
console.warn(getBranch)