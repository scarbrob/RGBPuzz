module.exports = async function (context, warmupTimer) {
    context.log('Warmup trigger fired at', new Date().toISOString());

    if (warmupTimer.isPastDue) {
        context.log('Timer is past due');
    }
};
