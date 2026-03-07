export const difficultyProfiles = {
    training: {
        id: 'training',
        displayName: 'Training',
        summary: 'Lower enemy pressure and slower fire for learning the routes.',
        enemyHealthMultiplier: 0.8,
        enemyFireIntervalMultiplier: 1.2,
        rewardMultiplier: 0.9,
        scoreMultiplier: 0.85
    },
    rookie: {
        id: 'rookie',
        displayName: 'Rookie',
        summary: 'Baseline campaign difficulty and intended starting point.',
        enemyHealthMultiplier: 1,
        enemyFireIntervalMultiplier: 1,
        rewardMultiplier: 1,
        scoreMultiplier: 1
    },
    veteran: {
        id: 'veteran',
        displayName: 'Veteran',
        summary: 'Denser opposition and more aggressive firing patterns.',
        enemyHealthMultiplier: 1.15,
        enemyFireIntervalMultiplier: 0.92,
        rewardMultiplier: 1.08,
        scoreMultiplier: 1.25
    },
    elite: {
        id: 'elite',
        displayName: 'Elite',
        summary: 'Hardest contract tier. Tougher targets and faster kill windows.',
        enemyHealthMultiplier: 1.3,
        enemyFireIntervalMultiplier: 0.84,
        rewardMultiplier: 1.16,
        scoreMultiplier: 1.5
    }
};

export function getDifficultyProfile(difficultyId = 'rookie') {
    return difficultyProfiles[difficultyId] || difficultyProfiles.rookie;
}

export function getAllDifficultyProfiles() {
    return Object.values(difficultyProfiles);
}
