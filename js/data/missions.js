export const missionProfiles = {
    1: {
        missionLevel: 1,
        codeName: 'Bravo Sector',
        title: 'Bravo Sector Coastal Sweep',
        sectorLabel: 'Bravo Sector',
        briefingText: 'Hostile forces have fortified the coast with radar arrays, bunkers, and refinery infrastructure. Punch through the shoreline defenses, clear the bridge corridor, and destroy the command ship guarding the sector.',
        objectives: [
            'Destroy shoreline radar and bunker defenses',
            'Strike high-value fuel and refinery targets for cash',
            'Secure the bridge corridor and intercept the sector flagship'
        ],
        landingText: 'Sector defenses are broken. Return to base for repair, rearm, and contract review.'
    }
};

export function getMissionProfile(level = 1) {
    return missionProfiles[level] || missionProfiles[1];
}
