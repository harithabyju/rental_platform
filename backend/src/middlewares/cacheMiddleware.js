const cache = new Map();

const cacheMiddleware = (duration) => (req, res, next) => {
    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse && Date.now() < cachedResponse.expiration) {
        console.log(`[CACHE HIT] ${key}`);
        return res.json(cachedResponse.data);
    }

    res.sendResponse = res.json;
    res.json = (body) => {
        cache.set(key, {
            data: body,
            expiration: Date.now() + duration * 1000
        });
        res.sendResponse(body);
    };
    next();
};

module.exports = cacheMiddleware;
