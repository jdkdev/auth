require(__dirname + '/outfitter.js')


const { env } = front('/environment')

module.exports = (args=null, count=2) => {
    if (env.get('FRONT_DEBUG')) console.log({full: process.argv})
    if (!args) args = process.argv

    args = args.splice(count)

    let argv = {}
    args.forEach(arg => {
        let v  = arg.split('=')
        if (v[1] === undefined) {
            argv[v[0]] = true
        } else {
            argv[v[0]] = _isNumber(v[1]) ? Number(v[1]) : v[1]
        }
    })
    
    if (env.get('FRONT_DEBUG')) console.log({processed: argv})
     
    return argv;
};

function _isNumber (x) {
    if (typeof x === 'number') return true;
    if (/^0x[0-9a-f]+$/i.test(x)) return true;
    return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
}
