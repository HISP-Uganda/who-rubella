const _ = require('lodash');
const axios = require('axios');
const fileSaver = require('file-saver');
const fs = require('fs');
var jsonexport = require('jsonexport');

var districts = require('./districts_map.json')

// const day1 = require(`${__dirname}/data/Day1.json`);
// const day2 = require(`${__dirname}/data/Day2.json`);
// const day3 = require(`${__dirname}/data/Day3.json`);
// const day5 = require(`${__dirname}/data/Day5.json`);
// const testData = require(`${__dirname}/data/odk.json`);

// const gp1 = _.groupBy(day1, 'districts');
// const gp2 = _.groupBy(day2, 'districts');
// const gp3 = _.groupBy(day3, 'districts');
// const gp5 = _.groupBy(day5, 'districts');
// const test = _.groupBy(testData, 'districts');
// const toBePicked = [
//     'list/name_of_post',
//     'list/target_population',
//     'list/other_factor_specify',
//     'list/children_vaccinated/years3_5',
//     'list/children_vaccinated/years6_14',
//     'list/children_vaccinated/months9_11',
//     'list/children_vaccinated/months12_24',
//     'list/post_staffing/number_mobilizers',
//     'list/post_staffing/number_health_workers',
//     'list/mr_vaccine_usage/no_vaccine_vials_issued',
//     'list/mr_vaccine_usage/no_diluent_ampules_issued',
//     'list/mr_vaccine_usage/no_vials_discarded_other_factors',
//     'list/mr_vaccine_usage/no_vaccine_vials_returned_unopened',
//     'list/mr_vaccine_usage/no_vials_discarded_due_partial_use',
//     'list/mr_vaccine_usage/no_diluent_ampules_returned_unopened',
//     'list/mr_vaccine_usage/no_vials_discarded_due_contamination',
//     'list/mr_vaccine_usage/no_vials_discarded_due_vvm_color_change'
// ]


// _.forOwn(test, function (v, k) {
//     const subcounties = _.groupBy(v, 'subcounty');
//     _.forOwn(subcounties, async function (v, k) {
//         const { region, districts, subcounty, day_of_results, date_of_results } = v[0];
//         const list = v.map(function (s) {
//             return _.pick(s, toBePicked)
//         });
//         const qw = {
//             region,
//             districts,
//             subcounty,
//             day_of_results,
//             date_of_results,
//             list
//         };

//         console.log(JSON.stringify(qw));

//         // await axios.post('http://localhost:3001', qw, { headers: { 'Accept': 'application/json' } })
//     });

// });
// const data = testData.map(testData => {
//     const { list, ...rest } = testData;
//     if (list) {
//         return list.map(l => {
//             return { ...l, ...rest }
//         });
//     }
//     return null
// }).filter(f => !!f);

// let final = _.flatten(data);


// final = JSON.stringify(final);
// fs.writeFileSync('student.json', final);

// jsonexport(final, function (err, csv) {
//     if (err) return console.log(err);
//     fs.writeFileSync('student.csv', csv);
// });

// console.log(districts)

const unit = [
    {
        "name": "ABIM ",
        "id": "g1lzs29C20E"
    },
    {
        "name": "ADJUMANI ",
        "id": "J1111gWF0pG"
    },
    {
        "name": "AGAGO ",
        "id": "B4LSiVBTuml"
    },
    {
        "name": "ALEBTONG ",
        "id": "Wv1KH7iS8pP"
    },
    {
        "name": "AMOLATAR ",
        "id": "X92Ud3RHdKi"
    },
    {
        "name": "AMUDAT ",
        "id": "QnPCp7kr71u"
    },
    {
        "name": "AMURIA ",
        "id": "lZeE6HDPMkM"
    },
    {
        "name": "AMURU ",
        "id": "BKp7lmAZcKp"
    },
    {
        "name": "APAC ",
        "id": "Ou8luzGR3k0"
    },
    {
        "name": "ARUA ",
        "id": "biZMRHcAPNk"
    },
    {
        "name": "BUDAKA ",
        "id": "OYv0hp438kC"
    },
    {
        "name": "BUDUDA ",
        "id": "MpvCFXxd7tH"
    },
    {
        "name": "BUGIRI ",
        "id": "lTfnsYMH1L3"
    },
    {
        "name": "BUGWERI",
        "id": "Lw5RNp9hNBf"
    },
    {
        "name": "BUHWEJU ",
        "id": "hUeW98i0WAE"
    },
    {
        "name": "BUIKWE ",
        "id": "uNJEkq5U5rJ"
    },
    {
        "name": "BUKEDEA ",
        "id": "F4ZVcF2PwnJ"
    },
    {
        "name": "BUKOMANSIMBI ",
        "id": "JdZPx499qr9"
    },
    {
        "name": "BUKWO ",
        "id": "ehikUkqcdlY"
    },
    {
        "name": "BULAMBULI ",
        "id": "bwyMzAMNUhX"
    },
    {
        "name": "BULIISA ",
        "id": "f6J4A6R7qVH"
    },
    {
        "name": "BUNDIBUGYO ",
        "id": "m80Axd3Ppr1"
    },
    {
        "name": "BUNYANGABU ",
        "id": "m2b7yckPklr"
    },
    {
        "name": "BUSHENYI ",
        "id": "nwV4HLe9U9V"
    },
    {
        "name": "BUSIA ",
        "id": "AX9Rndy7M8d"
    },
    {
        "name": "BUTALEJA ",
        "id": "lP3oVaqjvnw"
    },
    {
        "name": "BUTAMBALA ",
        "id": "URqeM39RIvv"
    },
    {
        "name": "BUTEBO ",
        "id": "pu6ttsh8xiJ"
    },
    {
        "name": "BUVUMA ",
        "id": "HRKSOfAXcjv"
    },
    {
        "name": "BUYENDE ",
        "id": "hLZ6Bkn54az"
    },
    {
        "name": "DOKOLO ",
        "id": "OcW90D3f5Ak"
    },
    {
        "name": "GOMBA ",
        "id": "RYx1kSYNuXq"
    },
    {
        "name": "GULU ",
        "id": "Syxs9daPuFE"
    },
    {
        "name": "HOIMA ",
        "id": "AvlDp8eRMru"
    },
    {
        "name": "IBANDA ",
        "id": "t2WXKIEKdTC"
    },
    {
        "name": "IGANGA ",
        "id": "tjhZjqenW2q"
    },
    {
        "name": "ISINGIRO ",
        "id": "YkieTQZ7v4D"
    },
    {
        "name": "JINJA ",
        "id": "LGX9Jz3duod"
    },
    {
        "name": "KAABONG ",
        "id": "WeUOsXtlkh8"
    },
    {
        "name": "KABALE ",
        "id": "vcnm7NLCNPZ"
    },
    {
        "name": "KABAROLE ",
        "id": "qKEJbMAgplr"
    },
    {
        "name": "KABERAMAIDO ",
        "id": "NZZMg7a7sBj"
    },
    {
        "name": "KAGADI ",
        "id": "cLJHT9J6mWL"
    },
    {
        "name": "KAKUMIRO ",
        "id": "Pl47laJiShG"
    },
    {
        "name": "KALANGALA ",
        "id": "FQJjVNxhvAP"
    },
    {
        "name": "KALIRO ",
        "id": "DxGKm0SGN1x"
    },
    {
        "name": "KALUNGU ",
        "id": "G2gEr4IUkIC"
    },
    {
        "name": "KAMPALA ",
        "id": "xVVsZL29BkH"
    },
    {
        "name": "KAMULI ",
        "id": "YN65lEdrIxA"
    },
    {
        "name": "KAMWENGE ",
        "id": "NUkEIK0mgNk"
    },
    {
        "name": "KANUNGU ",
        "id": "OM7GpHfXj97"
    },
    {
        "name": "KAPCHORWA ",
        "id": "NHYH3hBamvS"
    },
    {
        "name": "KAPELEBYONG",
        "id": "sgjazoAo5tM"
    },
    {
        "name": "KASSANDA",
        "id": "UKbEb5ShwcC"
    },
    {
        "name": "KATAKWI ",
        "id": "bm2SJzFp8vs"
    },
    {
        "name": "KAYUNGA ",
        "id": "owBXLPm3vPd"
    },
    {
        "name": "KESESE",
        "id": "IfbGRypBvsD"
    },
    {
        "name": "KIBAALE ",
        "id": "HPsIa11Lg9h"
    },
    {
        "name": "KIBOGA ",
        "id": "Dp9tZcsYNnM"
    },
    {
        "name": "KIBUKU ",
        "id": "VbFoR1k8VH5"
    },
    {
        "name": "KIKUUBE",
        "id": "ZigCTzSaIBT"
    },
    {
        "name": "KIRUHURA ",
        "id": "VzdiKJERIdW"
    },
    {
        "name": "KIRYANDONGO ",
        "id": "qXBuMwVAAz7"
    },
    {
        "name": "KISORO ",
        "id": "umipmHh9v3K"
    },
    {
        "name": "KITGUM ",
        "id": "pPDdW7PVDx8"
    },
    {
        "name": "KOBOKO ",
        "id": "aamkbLuhuE3"
    },
    {
        "name": "KOLE ",
        "id": "SGsg2OaMmZi"
    },
    {
        "name": "KOTIDO ",
        "id": "CMa2vNtKDyj"
    },
    {
        "name": "KUMI ",
        "id": "yEhKrOwq25A"
    },
    {
        "name": "KWANIA",
        "id": "BLV6M9lr86o"
    },
    {
        "name": "KWEEN ",
        "id": "WSTMUuWXGsS"
    },
    {
        "name": "KYANKWANZI ",
        "id": "BY2qdfv3Gog"
    },
    {
        "name": "KYEGEGWA ",
        "id": "JKlXW3fxHlP"
    },
    {
        "name": "KYENJOJO ",
        "id": "XYTiJ6ivqcP"
    },
    {
        "name": "KYOTERA ",
        "id": "RLUwQr8TSR4"
    },
    {
        "name": "LAMWO ",
        "id": "kx8tFI98oh5"
    },
    {
        "name": "LIRA ",
        "id": "LDP1ux1qHLt"
    },
    {
        "name": "LUUKA ",
        "id": "DpJMOHcEybJ"
    },
    {
        "name": "LUWERO ",
        "id": "pv74Fx49Eoj"
    },
    {
        "name": "LWENGO ",
        "id": "hyrmld6mZ4b"
    },
    {
        "name": "LYANTONDE ",
        "id": "iBapF8GFbDN"
    },
    {
        "name": "MANAFWA ",
        "id": "FVYXseyVtw2"
    },
    {
        "name": "MARACHA ",
        "id": "MqBQu1P6ScO"
    },
    {
        "name": "MASAKA ",
        "id": "ujomhD4R1Tw"
    },
    {
        "name": "MASINDI ",
        "id": "tF3E5ui9ezM"
    },
    {
        "name": "MAYUGE ",
        "id": "knrBhuygQ9V"
    },
    {
        "name": "MBALE ",
        "id": "JM4OKew4odm"
    },
    {
        "name": "MBARARA ",
        "id": "A1JefxJgZv8"
    },
    {
        "name": "MITOOMA ",
        "id": "mLvA40vNBOM"
    },
    {
        "name": "MITYANA ",
        "id": "RaTWCwEu00l"
    },
    {
        "name": "MOROTO ",
        "id": "vedOsQOVAID"
    },
    {
        "name": "MOYO ",
        "id": "f15u0evjndm"
    },
    {
        "name": "MPIGI ",
        "id": "TKHETPOwxbo"
    },
    {
        "name": "MUBENDE ",
        "id": "XUZ9wq0JXP8"
    },
    {
        "name": "MUKONO ",
        "id": "Sz7saemMOSQ"
    },
    {
        "name": "NABILATUK",
        "id": "hn6R6pnEVMW"
    },
    {
        "name": "NAKAPIRIPIRIT ",
        "id": "AqnUZ4NHPo1"
    },
    {
        "name": "NAKASEKE ",
        "id": "eDO0k1FaPw7"
    },
    {
        "name": "NAKASONGOLA ",
        "id": "lGNC6Y5hccz"
    },
    {
        "name": "NAMAYINGO ",
        "id": "ooHjbyBFYUi"
    },
    {
        "name": "NAMISINDWA ",
        "id": "mnqysRYe07y"
    },
    {
        "name": "NAMUTUMBA ",
        "id": "IxDpeWVeWsq"
    },
    {
        "name": "NAPAK ",
        "id": "S5rrSt2Tsfz"
    },
    {
        "name": "NEBBI ",
        "id": "XolDNg5RYU9"
    },
    {
        "name": "NGORA ",
        "id": "HgitpWI5HcI"
    },
    {
        "name": "NTOROKO ",
        "id": "CRTybiwxDMp"
    },
    {
        "name": "NTUNGAMO ",
        "id": "Do9rBerg9sn"
    },
    {
        "name": "NWOYA ",
        "id": "isiSQAD17en"
    },
    {
        "name": "OMORO ",
        "id": "PJZR9TEftHP"
    },
    {
        "name": "OTUKE ",
        "id": "hX7P7LTzUI9"
    },
    {
        "name": "OYAM ",
        "id": "tx6AEAUFhew"
    },
    {
        "name": "PADER ",
        "id": "CVdhwGqBcPl"
    },
    {
        "name": "PAKWACH ",
        "id": "wnrQoxgw1rD"
    },
    {
        "name": "PALLISA ",
        "id": "F54G6UMUpyI"
    },
    {
        "name": "RAKAI ",
        "id": "mz90UyLHnf2"
    },
    {
        "name": "RUBANDA ",
        "id": "URqM0FUYaWh"
    },
    {
        "name": "RUBIRIZI ",
        "id": "OuTJOB6vGOT"
    },
    {
        "name": "RUKIGA ",
        "id": "Fi9QUWR7Klt"
    },
    {
        "name": "RUKUNGIRI ",
        "id": "t0Uv6UtDbpp"
    },
    {
        "name": "SEMBABULE ",
        "id": "yA56HXyHWIY"
    },
    {
        "name": "SERERE ",
        "id": "IcN7IbicNFC"
    },
    {
        "name": "SHEEMA ",
        "id": "jdZ3joWq7FR"
    },
    {
        "name": "SIRONKO ",
        "id": "E0IworDd6ms"
    },
    {
        "name": "SOROTI ",
        "id": "S9x8LdqLybc"
    },
    {
        "name": "TORORO ",
        "id": "Ki2USRfIw6b"
    },
    {
        "name": "WAKISO ",
        "id": "sDpvf1Ef9Rk"
    },
    {
        "name": "YUMBE ",
        "id": "LoYZr6bWDac"
    },
    {
        "name": "ZOMBO ",
        "id": "i4X5qB9Hsc9"
    }
];

const units = _.fromPairs(unit.map(u => [String(u.name).trim(), u.id]))

console.log(units);

const { features, ...rest } = districts;
const finalFeatures = features.map(feature => {
    let newF = {}
    const props = feature.properties;
    if (units[props.District18]) {
        newF = { ...newF, code: units[props.District18] };
    }
    console.log(newF);
    return { ...rest, properties: newF }
});

const map = { ...rest, features: finalFeatures };


// console.log(map);
