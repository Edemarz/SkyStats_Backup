//Importing & requiring everything we need.
require("dotenv").config();
const Express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");
//Instantiating an express client;

const App = Express();

//Configuring Express
App.set('view engine', 'ejs');
App.set('views', path.join(__dirname, "./Views"));
App.use(bodyParser.json());
App.use(bodyParser.urlencoded({
    extended: true
}));
App.use(Express.json());
App.use(Express.urlencoded({
    extended: true
}));
App.use(Express.static(path.join(__dirname, "./CSS")));
App.use(Express.static(path.join(__dirname, '/'), { dotfiles: 'allow' }));
//Instantiating Express Getter
App.get("/", (req, res) => {
    res.status(200).render('index')
});

App.get("/usernotfound/:username/:type", (req, res) => {
    const object = {
        error: `${req.params.type == "invalid" ? `Invalid username: ${req.params.username}` : req.params.type == "neverjoined" ? `That player has never joined SkySim!` : `Failed to resolve username, Please make sure the player exist with the username: ${req.params.username}`}`
    };

    res.status(200).send(object);
});

//Instantiating Express Post
App.post("/", async (req, res) => {
    if (!req.body.SkySim_Username || typeof req.body.SkySim_Username !== 'string' || req.body.SkySim_Username.length > 16 || req.body.SkySim_Username.length < 3) return res.redirect(`/usernotfound/${encodeURIComponent(req.body.SkySim_Username)}/invalid`), console.log("A");

    console.log(`https://playerdb.co/api/player/minecraft/${req.body.SkySim_Username}`)

    const UUID = await axios({
        method: 'get',
        url: `https://playerdb.co/api/player/minecraft/${req.body.SkySim_Username}`
    }).catch((err) => null);

    if (!UUID || !UUID.data || UUID.data.success === false) return res.redirect(`/usernotfound/${encodeURIComponent(req.body.SkySim_Username)}/notfound`);

    if (UUID && UUID.data && UUID.data.code == "player.found") {
        const SkySimData = await axios({
            method: 'get',
            url: `https://api.skysim.sbs/?key=${process.env.API_KEY}&type=PLAYER_INFO&param=${UUID.data?.data?.player?.id}`
        }).catch((err) => null);

        const PlayerInventory = await axios({
            method: 'get',
            url: `https://api.skysim.sbs/?key=${process.env.API_KEY}&type=PLAYER_ITEMS&param=${UUID.data?.data?.player?.id}`
        }).catch((err) => null);

        if (SkySimData.data.error || PlayerInventory.data.error) return res.redirect(`/usernotfound/${encodeURIComponent(req.body.SkySim_Username)}/neverjoined`), console.log(SkySimData.data.error, PlayerInventory.data.errors);

        //Combat Skill Section

        //Calculating Skills XP & Level;
        const CombatXPArray = [0, 50, 175, 375, 675, 1175, 1925, 2925, 4425, 6425, 9925, 14925, 22425,
            32425, 47425, 67425, 97425, 147425, 222425, 322425, 522425, 822425, 1222425, 1722425, 2322425,
            3022425, 3822425, 4722425, 5722425, 6822425, 8022425, 9322425, 10722425, 12222425, 13822425,
            15522425, 17322425, 19222425, 21222425, 23322425, 25522425, 27822425, 30222425, 32722425,
            35322425, 38072425, 40972425, 44072425, 47472425, 51172425, 55172425, 59472425, 64072425,
            68972425, 74172425, 79672425, 85472425, 91572425, 97972425, 104672425, 111672425];
        let combData = {
            xp: null,
            level: null,
            abbrev: null,
            skill_progression_percentage: null,
            hypermaxed: false,
            greyPercentage: null,
            nextLevelXP: null
        };

        combData.xp = SkySimData.data.combatXP

        CombatXPArray.forEach((combatXP) => {
            if ((SkySimData.data.combatXP - combatXP) >= 1) combData.level = CombatXPArray.findIndex((xp) => xp === combatXP);
        });

        //Changing XP Format;
        const SI_SYMBOL = ["", "k", "M", "G", "T", "P", "E"];

        function abbreviateNumber(number) {

            // what tier? (determines SI symbol)
            var tier = Math.log10(Math.abs(number)) / 3 | 0;

            // if zero, we don't need a suffix
            if (tier == 0) return number;

            // get suffix and determine scale
            var suffix = SI_SYMBOL[tier];
            var scale = Math.pow(10, tier * 3);

            // scale the number
            var scaled = number / scale;

            // format number and add suffix
            return scaled.toFixed(1) + suffix;
        };

        combData.abbrev = abbreviateNumber(combData.xp);

        //Setting the next level xp;
        const nextXP = combData.level === 60 ? 'maxed' : combData.level === 59 ? CombatXPArray[combData.level + 1] : CombatXPArray[combData.level + 1];

        combData.nextLevelXP = nextXP == "maxed" ? 'maxed' : abbreviateNumber(nextXP);

        //Calculating progress bar percentage.
        let raw_data = nextXP == "maxed" ? 100 : SkySimData.data.combatXP / CombatXPArray[combData.level + 1] * 100;

        if (raw_data >= 100) raw_data = 100;
        else if (raw_data >= 1) {
            raw_data = raw_data;
        };

        //Getting 30% of the bar percentage above;

        const div1 = 30 / 100;

        const percent_of_percentage = div1 * raw_data;

        combData.skill_progression_percentage = percent_of_percentage;

        combData.greyPercentage = 30 - percent_of_percentage;

        //Setting hypermaxed settings;
        if (combData.level >= 50) combData.hypermaxed = true;

        //Mining Skill
        const MiningXPGoals = [0, 50, 175, 375, 675, 1175, 1925, 2925, 4425, 6425, 9925, 14925, 22425,
            32425, 47425, 67425, 97425, 147425, 222425, 322425, 522425, 822425, 1222425, 1722425, 2322425,
            3022425, 3822425, 4722425, 5722425, 6822425, 8022425, 9322425, 10722425, 12222425, 13822425,
            15522425, 17322425, 19222425, 21222425, 23322425, 25522425, 27822425, 30222425, 32722425,
            35322425, 38072425, 40972425, 44072425, 47472425, 51172425, 55172425, 59472425, 64072425,
            68972425, 74172425, 79672425, 85472425, 91572425, 97972425, 104672425, 111672425];
        let miningData = {
            xp: null,
            level: null,
            abbrev: null,
            skill_progression_percentage: null,
            hypermaxed: false,
            greyPercentage: null,
            nextLevelXP: null
        };

        miningData.xp = SkySimData.data.miningXP;

        MiningXPGoals.forEach((miningXP) => {
            if ((SkySimData.data.miningXP - miningXP) >= 1) miningData.level = MiningXPGoals.findIndex((xp) => xp === miningXP);
        });

        //Changing XP Format;
        miningData.abbrev = abbreviateNumber(miningData.xp);

        //Setting the next level xp;
        const miningNextXP = miningData.level === 60 ? 'maxed' : miningData.level === 59 ? MiningXPGoals[miningData.level + 1] : MiningXPGoals[miningData.level + 1];

        miningData.nextLevelXP = miningNextXP == "maxed" ? 'maxed' : abbreviateNumber(miningNextXP);

        //Calculating progress bar percentage.
        let raw_data_1 = miningNextXP == "maxed" ? 100 : SkySimData.data.miningXP / MiningXPGoals[miningData.level + 1] * 100;

        if (raw_data_1 >= 100) raw_data_1 = 100;
        else if (raw_data_1 >= 1) {
            raw_data_1 = raw_data_1;
        };

        //Getting 30% of the bar percentage above;

        const div1_1 = 30 / 100;

        const percent_of_percentage_1 = div1_1 * raw_data_1;

        miningData.skill_progression_percentage = percent_of_percentage_1;

        miningData.greyPercentage = 30 - percent_of_percentage_1;

        //Setting hypermaxed settings;
        if (miningData.level >= 50) miningData.hypermaxed = true;

        //Enchanting Skill

        const EnchantingXPGoals = [0, 50, 175, 375, 675, 1175, 1925, 2925, 4425, 6425, 9925, 14925, 22425,
            32425, 47425, 67425, 97425, 147425, 222425, 322425, 522425, 822425, 1222425, 1722425, 2322425,
            3022425, 3822425, 4722425, 5722425, 6822425, 8022425, 9322425, 10722425, 12222425, 13822425,
            15522425, 17322425, 19222425, 21222425, 23322425, 25522425, 27822425, 30222425, 32722425,
            35322425, 38072425, 40972425, 44072425, 47472425, 51172425, 55172425, 59472425, 64072425,
            68972425, 74172425, 79672425, 85472425, 91572425, 97972425, 104672425, 111672425];
        let enchantingData = {
            xp: null,
            level: null,
            abbrev: null,
            skill_progression_percentage: null,
            hypermaxed: false,
            greyPercentage: null,
            nextLevelXP: null
        };

        enchantingData.xp = SkySimData.data.enchantXP;

        EnchantingXPGoals.forEach((enchantingXP) => {
            if ((SkySimData.data.enchantXP - enchantingXP) >= 1) enchantingData.level = EnchantingXPGoals.findIndex((xp) => xp === enchantingXP);
        });

        //Changing XP Format;
        enchantingData.abbrev = abbreviateNumber(enchantingData.xp);

        //Setting the next level xp;
        const enchantingNextXP = enchantingData.level === 60 ? 'maxed' : enchantingData.level === 59 ? EnchantingXPGoals[enchantingData.level + 1] : EnchantingXPGoals[enchantingData.level + 1];

        enchantingData.nextLevelXP = enchantingNextXP == "maxed" ? 'maxed' : abbreviateNumber(enchantingNextXP);

        //Calculating progress bar percentage.
        let raw_data_2 = enchantingNextXP == "maxed" ? 100 : SkySimData.data.enchantXP / EnchantingXPGoals[enchantingData.level + 1] * 100;

        if (raw_data_2 >= 100) raw_data_2 = 100;
        else if (raw_data_2 >= 1) {
            raw_data_2 = raw_data_2;
        };

        //Getting 30% of the bar percentage above;

        const div1_2 = 30 / 100;

        const percent_of_percentage_2 = div1_2 * raw_data_2;

        enchantingData.skill_progression_percentage = percent_of_percentage_2;

        enchantingData.greyPercentage = 30 - percent_of_percentage_2;

        //Setting hypermaxed settings;
        if (enchantingData.level >= 50) enchantingData.hypermaxed = true;

        //Farming Section

        const FarmingXPGoals = [0, 50, 175, 375, 675, 1175, 1925, 2925, 4425, 6425, 9925, 14925, 22425,
            32425, 47425, 67425, 97425, 147425, 222425, 322425, 522425, 822425, 1222425, 1722425, 2322425,
            3022425, 3822425, 4722425, 5722425, 6822425, 8022425, 9322425, 10722425, 12222425, 13822425,
            15522425, 17322425, 19222425, 21222425, 23322425, 25522425, 27822425, 30222425, 32722425,
            35322425, 38072425, 40972425, 44072425, 47472425, 51172425, 55172425, 59472425, 64072425,
            68972425, 74172425, 79672425, 85472425, 91572425, 97972425, 104672425, 111672425];
        let farmingData = {
            xp: null,
            level: null,
            abbrev: null,
            skill_progression_percentage: null,
            hypermaxed: false,
            greyPercentage: null,
            nextLevelXP: null
        };

        farmingData.xp = SkySimData.data.farmingXP;

        FarmingXPGoals.forEach((farmingXP) => {
            if ((SkySimData.data.farmingXP - farmingXP) >= 1) farmingData.level = FarmingXPGoals.findIndex((xp) => xp === farmingXP);
        });

        //Changing XP Format;
        farmingData.abbrev = abbreviateNumber(farmingData.xp);

        //Setting the next level xp;
        const farmingNextXP = farmingData.level === 60 ? 'maxed' : farmingData.level === 59 ? FarmingXPGoals[farmingData.level + 1] : FarmingXPGoals[farmingData.level + 1];

        farmingData.nextLevelXP = farmingNextXP == "maxed" ? 'maxed' : abbreviateNumber(farmingNextXP);

        //Calculating progress bar percentage.
        let raw_data_3 = farmingNextXP == "maxed" ? 100 : SkySimData.data.farmingXP / FarmingXPGoals[farmingData.level + 1] * 100;

        if (raw_data_3 >= 100) raw_data_3 = 100;
        else if (raw_data_3 >= 1) {
            raw_data_3 = raw_data_3;
        };

        //Getting 30% of the bar percentage above;

        const div1_3 = 30 / 100;

        const percent_of_percentage_3 = div1_3 * raw_data_3;

        farmingData.skill_progression_percentage = percent_of_percentage_3;

        farmingData.greyPercentage = 30 - percent_of_percentage_3;

        //Setting hypermaxed settings;
        if (farmingData.level >= 50) farmingData.hypermaxed = true;

        //Foraging Section;

        const ForagingXPGoals = [0, 50, 175, 375, 675, 1175, 1925, 2925, 4425, 6425, 9925, 14925, 22425,
            32425, 47425, 67425, 97425, 147425, 222425, 322425, 522425, 822425, 1222425, 1722425, 2322425,
            3022425, 3822425, 4722425, 5722425, 6822425, 8022425, 9322425, 10722425, 12222425, 13822425,
            15522425, 17322425, 19222425, 21222425, 23322425, 25522425, 27822425, 30222425, 32722425,
            35322425, 38072425, 40972425, 44072425, 47472425, 51172425, 55172425, 59472425, 64072425,
            68972425, 74172425, 79672425, 85472425, 91572425, 97972425, 104672425, 111672425];
        let foragingData = {
            xp: null,
            level: null,
            abbrev: null,
            skill_progression_percentage: null,
            hypermaxed: false,
            greyPercentage: null,
            nextLevelXP: null
        };

        foragingData.xp = SkySimData.data.foragingXP;

        ForagingXPGoals.forEach((foragingXP) => {
            if ((SkySimData.data.foragingXP - foragingXP) >= 1) foragingData.level = ForagingXPGoals.findIndex((xp) => xp === foragingXP);
        });

        //Changing XP Format;
        foragingData.abbrev = abbreviateNumber(foragingData.xp);

        //Setting the next level xp;
        const foragingNextXP = foragingData.level === 60 ? 'maxed' : foragingData.level === 59 ? ForagingXPGoals[foragingData.level + 1] : ForagingXPGoals[foragingData.level + 1];

        foragingData.nextLevelXP = foragingNextXP == "maxed" ? 'maxed' : abbreviateNumber(foragingNextXP);

        //Calculating progress bar percentage.
        let raw_data_4 = foragingNextXP == "maxed" ? 100 : SkySimData.data.foragingXP / ForagingXPGoals[foragingData.level + 1] * 100;

        if (raw_data_4 >= 100) raw_data_4 = 100;
        else if (raw_data_4 >= 1) {
            raw_data_4 = raw_data_4;
        };

        //Getting 30% of the bar percentage above;

        const div1_4 = 30 / 100;

        const percent_of_percentage_4 = div1_4 * raw_data_4;

        foragingData.skill_progression_percentage = percent_of_percentage_4;

        foragingData.greyPercentage = 30 - percent_of_percentage_4;

        //Setting hypermaxed settings;
        if (foragingData.level >= 50) foragingData.hypermaxed = true;

        //Setting User Data
        let userData = {
            coins: {
                raw: SkySimData.data.coins,
                abbrev: abbreviateNumber(SkySimData.data.coins),
                bank: {
                    raw: SkySimData.data.bankCoins,
                    abbrev: abbreviateNumber(SkySimData.data.bankCoins)
                }
            },
            bits: {
                raw: SkySimData.data.bits,
                abbrev: abbreviateNumber(SkySimData.data.bits)
            }
        };

        //Rendering page.

        console.log(SkySimData.data);

        res.render('stats', {
            data: SkySimData.data,
            username: req.body.SkySim_Username,
            uuidData: UUID.data?.data?.player,
            skills: {
                combat: combData,
                mining: miningData,
                enchanting: enchantingData,
                farming: farmingData,
                foraging: foragingData
            },
            constants: {
                colorCodes: require("./Constants/ColorCodes")
            },
            userData: userData
        });
    };
});
//Listening to a specific port;
App.listen(3001, () => console.log("SkyStats is now running!"));