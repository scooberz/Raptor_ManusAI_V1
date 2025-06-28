/**
 * A generic object pool for managing and recycling game objects.
 */
class ObjectPool {
    constructor(objectFactory, initialSize) {
        this.pool = [];
        this.objectFactory = objectFactory;

        // Pre-populate the pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.objectFactory());
        }
    }

    /**
     * Get an inactive object from the pool.
     */
    get() {
        // Find an available object in the existing pool
        for (let i = 0; i < this.pool.length; i++) {
            if (!this.pool[i].active) {
                return this.pool[i];
            }
        }

        // If no objects are available, expand the pool by one.
        // This is a failsafe; ideally, the initial size is sufficient.
        console.warn("ObjectPool expanded. Consider increasing initial size.");
        const newObject = this.objectFactory();
        this.pool.push(newObject);
        return newObject;
    }

    /**
     * Release an object back into the pool by marking it as inactive.
     * @param {object} obj - The object to release.
     */
    release(obj) {
        obj.active = false;
    }
}

export { ObjectPool }; 