export class EffectManager {
    constructor() {
        this.effects = [];
    }

    add(effect) {
        this.effects.push(effect);
    }

    update(deltaTime) {
        // Iterate backwards to safely remove inactive effects
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.update(deltaTime);
            if (!effect.active) {
                this.effects.splice(i, 1);
            }
        }
    }

    render(context) {
        for (const effect of this.effects) {
            effect.render(context);
        }
    }
    
    clear() {
        this.effects = [];
    }
} 