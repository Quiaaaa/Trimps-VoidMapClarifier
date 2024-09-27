// these are the calculated number of cells needed to clear for a 99% chance, 50% chance, and 1% chance of having gotten the void map that quickly
// they are rounded up, though, for nicer displaying.
const Wombats_VMC_VMRate_random_unlucky = 2149; // 99%
const Wombats_VMC_VMRate_random_average = 837; // 50%
const Wombats_VMC_VMRate_random_lucky = 105; // 1%
// for doing predictive voids-up-to-here: (unrounded because these ones don't end up getting printed directly)
const Wombats_VMC_VMRate_middling_lucky = 718.5; // 40%
const Wombats_VMC_VMRate_middling_unlucky = 960.5; // 60%
//  1% chance is at 104.5 cells; 99% chance is at 2148.5 cells.
// 10% chance is at 328.5 cells; 90% chance is at 1520.5 cells.
// 25% chance is at 540.5 cells; 75% chance is at 1180.5 cells.
// 40% chance is at 718.5 cells; 60% chance is at  960.5 cells.
//                50% chance is at 836.5 cells.
// formulae:
//     per_cell = floor(x/10) / 50000
//     cumulative = 1 - prod(n=1->x) [1-per_cell(n)]
initialiseVoidMapClarifier();

function initialiseVoidMapClarifier() {
    if (document.getElementById('VoidMapClarifier') === null) {
        const containerVoidMapInfo = document.createElement('DIV');
  
        let standard_colours = ' color: rgb(0,0,0); background-color: rgb(255,255,255);';
        let darkmode_colours = ' color: rgb(0,0,0); background-color: rgb(93,93,93);';
    
        let chosen_colours = standard_colours;
        if (game.options.menu.darkTheme.enabled == 2) {
            chosen_colours = darkmode_colours;
        }
        containerVoidMapInfo.setAttribute('style', 'display: block; position: absolute; top: 0; right: 0; width: 30%; font-size: 0.7em; text-align: center;' + chosen_colours);
        const textareaVoidmapInfo = document.createElement('SPAN');
        containerVoidMapInfo.setAttribute('onmouseover', VMC_populateVoidMapTooltip());
        containerVoidMapInfo.setAttribute('onmouseout', 'tooltip("hide")');
        textareaVoidmapInfo.id = 'VoidMapClarifier';
        containerVoidMapInfo.appendChild(textareaVoidmapInfo);
        let target_area = document.getElementById('science');
        target_area.insertBefore(containerVoidMapInfo, target_area.children[0]);
    }
    populateVoidMapClarifierInfo();
    setInterval( function () {
        populateVoidMapClarifierInfo();
    }, 1000);
}

function VMC_getCurrentVMDCeffect() {
    let shieldbonus = (1 - (getHeirloomBonus("Shield", "voidMaps") / 100))
    let extraV = 0;
	if (game.challenges.Nurture.boostsActive() && game.challenges.Nurture.getLevel >= 4) {
        extraV = 0.2;
    }
    let goldenbonus = (1 - (game.goldenUpgrades.Void.currentBonus + extraV))
    return shieldbonus * goldenbonus
}

function VMC_getMaxVMDCeffect() {
    let shieldbonus = (1 - (getHeirloomBonus("Shield", "voidMaps") / 100))
    let extraV = 0;
	if (game.challenges.Nurture.boostsActive() && game.challenges.Nurture.getLevel >= 4) {
        extraV = 0.2;
    }
    let goldenbonus = (1 - (0.72 + extraV))
    return shieldbonus * goldenbonus
}
function VMC_getMinVMDCeffect() {
    let shieldbonus = (1 - (getHeirloomBonus("Shield", "voidMaps") / 100))
    let extraV = 0;
	if (game.challenges.Nurture.boostsActive() && game.challenges.Nurture.getLevel >= 4) {
        extraV = 0.2;
    }
    let goldenbonus = (1 - (extraV))
    return shieldbonus * goldenbonus
}

function VMC_getsocalledZ() {
    let max = getVoidMaxLevel();
    let lastPortal = getLastPortal();
    if ((lastPortal != -1) && (max - lastPortal < 25)) {
        max = lastPortal;
    }
    if (max > 200) {
        max = 200;
    }
    let min = (max > 80) ? (1000 + ((max - 80) * 13)) : 1000;

    return min
}

function VMC_getCurrentVMDropCooldown() {
    let netBonus = VMC_getCurrentVMDCeffect();
    let naturalCooldownCellCount = VMC_getsocalledZ();
    return Math.ceil(netBonus * naturalCooldownCellCount)
}
function VMC_getFullGoldenVMDropWait() {
    let netBonus = VMC_getMaxVMDCeffect();
    let naturalCooldownCellCount = VMC_getsocalledZ();
    return Math.ceil(netBonus * naturalCooldownCellCount) + Wombats_VMC_VMRate_random_average
}
function VMC_getNoGoldenVMDropWait() {
    let netBonus = VMC_getMinVMDCeffect();
    let naturalCooldownCellCount = VMC_getsocalledZ();
    return Math.ceil(netBonus * naturalCooldownCellCount) + Wombats_VMC_VMRate_random_average
}

function VMC_getCurrentExpectedVMWait() {
    return VMC_getCurrentVMDropCooldown() + Wombats_VMC_VMRate_random_average;
}
function VMC_getLuckyVMWait() {
    return VMC_getCurrentVMDropCooldown() + Wombats_VMC_VMRate_random_lucky;
}
function VMC_getUnluckyVMWait() {
    return VMC_getCurrentVMDropCooldown() + Wombats_VMC_VMRate_random_unlucky;
}
function VMC_getSomewhatLuckyVMWait() {
    return VMC_getCurrentVMDropCooldown() + Wombats_VMC_VMRate_middling_lucky;
}
function VMC_getSomewhatUnluckyVMWait() {
    return VMC_getCurrentVMDropCooldown() + Wombats_VMC_VMRate_middling_unlucky;
}

function VMC_getGoldenVoidVarianceText() {
    let varianceText = '';
    if (game.goldenUpgrades.Void.currentBonus < 0.72) {
        varianceText += `With 8 Golden Voids, your estimated cells-per-void-map would be ` + VMC_getFullGoldenVMDropWait() + `. `;
    }
    if (game.goldenUpgrades.Void.currentBonus > 0) {
        varianceText += `With 0 Golden Voids, your estimated cells-per-void-map would be ` + VMC_getNoGoldenVMDropWait() + `. `;
    }
    let difference_in_cells = VMC_getNoGoldenVMDropWait() - VMC_getFullGoldenVMDropWait();
    let difference_in_percentage = (VMC_getNoGoldenVMDropWait() / VMC_getFullGoldenVMDropWait());
    varianceText += `This would be a net difference of ` + difference_in_cells + ` cells-per-void-map. Buying 8 golden voids means you get void maps about `;
    varianceText += `<b>` + prettify(difference_in_percentage) + `</b> times faster.`;
    return varianceText
}

function VMC_makeStringForDisplay() {
    if ((game.global.totalPortals < 1) || (game.global.universe == 2 && game.global.totalRadPortals < 1)) {
        return 'N/A';
    }
    
    const voidmapstring = game.global.lastVoidMap + "<br\>/ " + VMC_getCurrentExpectedVMWait();
    return voidmapstring
}

function VMC_getCurrentTotalVoids() {
    return game.global.totalVoidMaps + game.stats.totalVoidMaps.value;
}

function VMC_getEstimateVoidsWithGivenWait(estimatedCellsPerVoid) {
    let currentCellTotal = (game.stats.zonesCleared.value * 100) + game.global.lastClearedCell;
    let expectedBasicVoidsThisRun = currentCellTotal / estimatedCellsPerVoid;

    let expectedHazVoidsThisRun = 0;
    if (game.global.ShieldEquipped && game.global.ShieldEquipped.rarity >= 10 && game.heirlooms.Shield.voidMaps.currentBonus > 0) {
        expectedHazVoidsThisRun = currentCellTotal / 1000
    }

    let voidspecVoidCount = 0;
    if (game.talents.voidSpecial.purchased) {
        voidspecVoidCount += Math.floor(getLastPortal() / 100);
        if (game.talents.voidSpecial2.purchased) {
            voidspecVoidCount += Math.floor((getLastPortal() + 50) / 100);
        }
    }

    let fluffyVoidCount = 0;
    if (Fluffy.isRewardActive('voidance')) {
        fluffyVoidCount += 4;
    }
    if (Fluffy.isRewardActive('voidelicious')) {
        fluffyVoidCount += 4;
    }
    let scruffyVoidMult = 1
    if (Fluffy.isRewardActive('moreVoid')) {
        scruffyVoidMult = 1.2
    }

    let voidmapPermaBonus = game.permaBoneBonuses.voidMaps.owned;
    let netBoneVoidsBoost = (100 + voidmapPermaBonus) / 100;

    let totalnetVoidMapEstimate = netBoneVoidsBoost * scruffyVoidMult * (expectedBasicVoidsThisRun + expectedHazVoidsThisRun + voidspecVoidCount + fluffyVoidCount);
    return totalnetVoidMapEstimate;
}

function VMC_stringifyCurrentBoneBonusTimer() {
    let current_tracker_moment = game.permaBoneBonuses.voidMaps.tracker;
    let current_number_owned = game.permaBoneBonuses.voidMaps.owned;
    if (current_number_owned == 0) {
        return ''
    }
    let drops_until_next_double = Math.floor((99 - current_tracker_moment) / current_number_owned);
    if (drops_until_next_double <= 0) {
        return 'Your next void map drop will be duplicated!'
    }
    let returntext = 'Your next duplicated void map drop is <b>' + drops_until_next_double + '</b> drop';
    if (drops_until_next_double != 1) {
        returntext += 's';
    }
    returntext += ' away.'
    return returntext
}

function VMC_populateVoidMapTooltip() {
    if (usingRealTimeOffline == true) {
      return '';
    }
    let tooltipstring = "tooltip('Void Map Drop Rate Breakdown', 'customText', event, '";
    tooltipstring += `<p>Your current Void Map Drop Cooldown is <b>` + VMC_getCurrentVMDropCooldown() + `</b>, after which the random-chance-per-cell starts ticking up.`;
    tooltipstring += ` You got your last void map <b>` + game.global.lastVoidMap + `</b> cells ago.`;
    if (VMC_getCurrentVMDropCooldown() > game.global.lastVoidMap) {
        tooltipstring += ` You need to clear <b>` + (VMC_getCurrentVMDropCooldown() - game.global.lastVoidMap) + `</b> more cells before you could possibly get the next void map.`;
    } else {
        let chance = (Math.floor((game.global.lastVoidMap - VMC_getCurrentVMDropCooldown()) / 10) / 50000) * 100
        tooltipstring += ` You currently have a <b>` + prettify(chance) + `%</b> chance to get a void map every cell you clear.`
	tooltipstring += ` This chance will increase by ` + prettify(100/50000) + `% for every 10 cells you clear.`;
    }
    tooltipstring += `</p>`;
    if (game.global.ShieldEquipped && game.global.ShieldEquipped.rarity >= 10 && game.heirlooms.Shield.voidMaps.currentBonus > 0) {
        tooltipstring += `<p>Your current shield heirloom is also giving an additional free void map for every 10 zones you clear with it equipped.</p>`;
    }
    tooltipstring += `<p>Statistically, you will get a void map to drop every <b>` + VMC_getCurrentExpectedVMWait() + `</b> cells; however, this is a pretty wide random distribution.`;
    tooltipstring += `1% of the time, you will get void maps every <b>` + VMC_getLuckyVMWait() + `</b> cells,`
    tooltipstring += ` and 1% of the time, you will get void maps only every <b>` + VMC_getUnluckyVMWait() + `</b> cells.`;
    tooltipstring += `</p>`;
    tooltipstring += `<p>` + VMC_getGoldenVoidVarianceText() + `</p>`;
    tooltipstring += `<p>` + VMC_stringifyCurrentBoneBonusTimer() + `</p>`;
    tooltipstring += `<p>You have gotten <b>` + VMC_getCurrentTotalVoids() + `</b> void maps total this run!</p>`;
    tooltipstring += `<p>With your current <b>` + prettify(100 - Math.round(VMC_getCurrentVMDCeffect()*100)) + `%</b> VMDC,`
    tooltipstring += ` you would expect to have gotten something like (estimate!) <b>` + prettify(VMC_getEstimateVoidsWithGivenWait(VMC_getCurrentExpectedVMWait())) + `</b> void maps.`;
    let a_bit_lucky_version = VMC_getEstimateVoidsWithGivenWait(VMC_getSomewhatLuckyVMWait());
    let a_bit_unlucky_version = VMC_getEstimateVoidsWithGivenWait(VMC_getSomewhatUnluckyVMWait());
    tooltipstring += ` However, anywhere from ` + prettify(a_bit_unlucky_version) + ` to ` + prettify(a_bit_lucky_version) + ` are within 10% odds.`
    tooltipstring += ` (these numbers change dramatically if you switch heirlooms. be not alarmed)</p>`;
    tooltipstring += "')"
    return tooltipstring
}

function populateVoidMapClarifierInfo() {
    if (usingRealTimeOffline == true) {
      return '';
    }

    const target_element = document.getElementById('VoidMapClarifier');
    const the_information = VMC_makeStringForDisplay();
    target_element.innerHTML = the_information;
    target_element.parentNode.setAttribute('onmouseover', VMC_populateVoidMapTooltip());
}
