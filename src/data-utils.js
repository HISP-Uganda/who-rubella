import _ from "lodash";
import axios from 'axios';
import dotenv from "dotenv";
import winston from './winston';
import { generateUid } from './uid';
import moment from 'moment';
import { createObjectCsvWriter } from 'csv-writer';

const URL = require('url').URL;

const result = dotenv.config();

if (result.error) {
    throw result.error
}

export const getCOC = (val) => {
    const search = String(val).toLowerCase();
    if (search.indexOf('one') !== -1) {
        return 'ZpyTYdeiDkA'
    } else if (search.indexOf('two') !== -1) {
        return 'aEqdGN2HOLQ';
    } else if (search.indexOf('three') !== -1) {
        return 'WybnHDOJacu';
    } else if (search.indexOf('four') !== -1) {
        return 'UK2et7FhfIq';
    } else if (search.indexOf('five') !== -1) {
        return 'jRUmp92Y4bE';
    } else if (search.indexOf('six') !== -1) {
        return 'ixtIbhR0XdG';
    } else if (search.indexOf('seven') !== -1) {
        return 'c7HMdHJ9R1C';
    } else {
        return 'HllvX50cXC0'
    }
}

export const mrDataValues = async (list, ous, period, attributeOptionCombo) => {
    const baseUrl = getDHIS2Url();
    const keys = {
        'list/target_population': {
            dataElement: 'JHjeYt6yqBX',
            period,
            categoryOptionCombo: 'HllvX50cXC0',
            attributeOptionCombo
        },
        // 'list/other_factor_specify': {
        //     dataElement: 'T05lrtJZwYT',
        //     period,
        //     categoryOptionCombo: 'HllvX50cXC0',
        //     attributeOptionCombo
        // },
        'list/children_vaccinated/years3_5': {
            dataElement: 'uCFg0FT8sV8',
            period,
            categoryOptionCombo: 'ZlH8d3z64XG',
            attributeOptionCombo
        },
        'list/children_vaccinated/years6_14': {
            dataElement: 'uCFg0FT8sV8',
            period,
            categoryOptionCombo: 'KU1DPon4Siu',
            attributeOptionCombo
        },
        'list/children_vaccinated/months9_11': {
            dataElement: 'uCFg0FT8sV8',
            period,
            categoryOptionCombo: 'eQxG5pWG8hW',
            attributeOptionCombo
        },
        'list/children_vaccinated/months12_24': {
            dataElement: 'uCFg0FT8sV8',
            period,
            categoryOptionCombo: 'rExgwWGz0xi',
            attributeOptionCombo
        },
        'list/post_staffing/number_mobilizers': {
            dataElement: 'bmhiRT3366M',
            period,
            categoryOptionCombo: 'HllvX50cXC0',
            attributeOptionCombo
        },
        'list/post_staffing/number_health_workers': {
            dataElement: 'zwW07y5987X',
            period,
            categoryOptionCombo: 'HllvX50cXC0',
            attributeOptionCombo
        },
        'list/mr_vaccine_usage/no_vaccine_vials_issued': {
            dataElement: 'UGzRCLeZ7VK',
            period,
            categoryOptionCombo: 'HllvX50cXC0',
            attributeOptionCombo
        },
        'list/mr_vaccine_usage/no_diluent_ampules_issued': {
            dataElement: 'c9rY7LYUDdO',
            period,
            categoryOptionCombo: 'HllvX50cXC0',
            attributeOptionCombo
        },
        'list/mr_vaccine_usage/no_vials_discarded_other_factors': {
            dataElement: 'EI3lwOn7BFy',
            period,
            categoryOptionCombo: 'E4wrUHavnxw',
            attributeOptionCombo
        },
        'list/mr_vaccine_usage/no_vaccine_vials_returned_unopened': {
            dataElement: 'fn8jd7n6gIT',
            period,
            categoryOptionCombo: 'HllvX50cXC0',
            attributeOptionCombo
        },
        'list/mr_vaccine_usage/no_vials_discarded_due_partial_use': {
            dataElement: 'EI3lwOn7BFy',
            period,
            categoryOptionCombo: 'DwzqPmIFldV',
            attributeOptionCombo
        },
        'list/mr_vaccine_usage/no_diluent_ampules_returned_unopened': {
            dataElement: 'W9L27HbKRA4',
            period,
            categoryOptionCombo: 'HllvX50cXC0',
            attributeOptionCombo
        },
        'list/mr_vaccine_usage/no_vials_discarded_due_contamination': {
            dataElement: 'EI3lwOn7BFy',
            period,
            categoryOptionCombo: 'YuPxWTajxgw',
            attributeOptionCombo
        },
        'list/mr_vaccine_usage/no_vials_discarded_due_vvm_color_change': {
            dataElement: 'EI3lwOn7BFy',
            period,
            categoryOptionCombo: 'w7BoUsyaywi',
            attributeOptionCombo
        }
    }
    let dataValues = list.map(l => {
        const p = l['list/name_of_post'] || l['list/name_of_post_visited'];
        const post = String(p).replace(/\\n/g, '').trim().toLowerCase();
        const currentKeys = _.keys(l).filter(k => k !== 'list/name_of_post' && k !== 'list/name_of_post_visited');
        const orgUnit = ous[post];
        if (orgUnit) {
            const current = currentKeys.map(k => {
                const value = l[k];
                let val = keys[k];
                if (val) {
                    val = { ...val, orgUnit, value }
                }
                return val;
            });
            return current
        } else {
            return [];
        }
    });


    dataValues = _.flatten(dataValues).filter(v => {
        return v && v !== null && v !== undefined
    });

    let response = {}
    if (dataValues.length > 0) {
        try {
            response = await postAxios(`${baseUrl}/dataValueSets`, { dataValues });
            response = response.data;
        } catch (e) {
            response = 'error';
            // console.log(e);
        }
    }
    return response;
}

export const mapEventData = (list, ous) => {
    const mapper = {
        "_id": "",
        "gps1": "",
        "gps2": "",
        "_tags": "",
        "_uuid": "",
        "today": "",
        "_notes": "",
        "agency": "",
        "region": "",
        "_edited": "",
        "_status": "",
        "endtime": "",
        "remarks": "",
        "_version": "",
        "deviceid": "",
        "_duration": "",
        "_xform_id": "",
        "districts": "",
        "starttime": "",
        "subcounty": "",
        "_attachments": "",
        "_geolocation": "",
        "_media_count": "",
        "_total_media": "",
        "formhub/uuid": "",
        "name_village": "",
        "_submitted_by": "",
        "date_campaign": "",
        "meta/instanceID": "",
        "name_supervisor": "",
        "_submission_time": "",
        "_xform_id_string": "",
        "level_supervision": "",
        "target_population": "",
        "_bamboo_dataset_id": "",
        "_media_all_received": "",
        "aefi_reported_at_post": "",
        "ice_packs_conditioned": "miBHyru8TJ1",
        "vaccination_team_code": "",
        "mobile_number_supervisor": "",
        "name_of_facility_visited": "",
        "post_reaching_its_targets": "jK9ylxSyIoH",
        "vaccination_post_location": "",
        "opv_administered_correctly": "",
        "team_provided_with_transport": "RQm8Dl9TUqn",
        "opv_vaccinator_making_left_finger": "",
        "team_receive_poster_and_materials": "HFN5TTWOb7a",
        "vaccination_team_members_complete": "f33ZZmn4iZQ",
        "layout_of_vaccination_post_arrange": "kvt42Dq9BYn",
        "only_syringes_placed_in_safety_box": "gSqZgu4L0U9",
        "team_provided_with_two_marker_pens": "",
        "vaccinator_recap_syringe_after_use": "G7HXVfATlYl",
        "active_searches_done_house_to_house": "OOQpgGgPbTN",
        "poster_displayed_at_vaccination_post": "q0yYf8GxTdG",
        "safety_boxes_appropriately_assembled": "ByJFCBOgrLJ",
        "day_supply_of_mr_vaccines_and_diluents": "UjmNOUwnwNg",
        "safety_boxes_closed_and_marked_as_used": "V0pVuWh2dSR",
        "team_provide_health_education_to_parents": "QBretI5lJFW",
        "vaccine_carrier_have_two_frozen_Icepacks": "",
        "clear_and_orderly_flow_of_clients_at_post": "zBmkFbB7JJW",
        "parents_caregivers_reminded_to_continue_ri": "HRVTKKCeMM2",
        "vaccinator_fill_only_one_syringe_at_a_time": "ffxjb0a2qop",
        "vaccinator_properly_clean_vaccination_site": "rZvWDKs4UM7",
        "number_of_safety_boxes_sufficient_for_today": "",
        "vaccine_vials_being_used_placed_on_foam_pad": "anFZSVQR1qJ",
        "disposed_syringes_exposed_out_the_safety_box": "i2VqgJqZuVX",
        "filled_up_safety_box_kept_in_secure_location": "xDPqFOKS0g5",
        "safety_boxes_filled_more_than_three_quarters": "IyIJW9e2lNW",
        "ad_syringes_equal_doses_of_injectable_vaccines": "I7PQ0XuJJ9c",
        "opv_team_have_vaccine_carrier_for_opv_vaccines": "",
        "vaccinators_accurately_recording_on_tally_sheet": "Y5bCtjO1rwH",
        "vaccinators_know_plan_for_disposal_safety_boxes": "y9TWI8tnGwG",
        "vaccination_team_with_gio_style_vaccine_carriers": "",
        "opv_vaccinator_tallying_opv_tally_sheet_correctly": "",
        "vaccine_carrier_for_storing_vaccines_and_diluents": "QYAyID1AkIn",
        "vaccinator_administer_mr_vaccine_at_left_upper_arm": "E4GukBl0L3m",
        "vaccination_post_supervisor_knows_how_to_manage_aefi": "ASgrwvMHcyz",
        "adequate_number_aefi_forms/number_aefi_forms_required": "vCTiFoajlK3",
        "adequate_number_aefi_forms/number_aefi_forms_available": "URjVjhARy1V",
        "no_reconstitution_syringes_equals_no_mr_vaccines_vials": "g3xCap8xZlS",
        "adequate_number_pen_markers/number_pen_markers_required": "bKJULmZqPEP",
        "vaccinator_accurately_draw_and_give_appropriate_mr_dose": "S2qB7SAgsBO",
        "adequate_number_pen_markers/number_pen_markers_available": "pEG23J2jv52",
        "adequate_number_plastic_bags/number_plastic_bags_required": "MELrBjIvlFA",
        "adequate_number_safety_boxes/number_safety_boxes_required": "fwkrtoKlFCZ",
        "adequate_number_tally_sheets/number_tally_sheets_required": "XEYER7d8FK8",
        "adequate_number_plastic_bags/number_plastic_bags_available": "ZX5qi0m6P7V",
        "adequate_number_safety_boxes/number_safety_boxes_available": "h9t0cDwIsLR",
        "adequate_number_tally_sheets/number_tally_sheets_available": "ulxi3KoUwpa",
        "vaccinator_administer_mr_vaccine_through_subcutaneous_route": "YVpxcWerDo5",
        "adequate_number_aefi_tool_kits/number_aefi_tool_kits_required": "vmU9CtdiIYb",
        "adequate_number_aefi_tool_kits/number_aefi_tool_kits_available": "m2duLA540qc",
        "community_adequately_informed_of_campaign_dates_purpose_and_age": "t8CD3YQDlXs",
        "vaccination_post_supervisor_and_vaccinators_know_aefi_to_report": "oUO6OiixRsR",
        "adequate_number_roll_cotton_wool/number_roll_cotton_wool_required": "Y79DkODWke4",
        "adequate_number_vials_mr_diluent/number_vials_mr_diluent_required": "tFlUU7X77Xp",
        "adequate_number_vials_mr_vaccine/number_vials_mr_vaccine_required": "hcCdk0v6SFS",
        "vaccination_post_supervisor_and_vaccinators_know_info_to_put_aefi": "lHZV7sxNxXj",
        "vaccines_and_diluents_not_in_use_stored_in_second_vaccine_carrier": "VOHQ6iaNt6c",
        "adequate_number_roll_cotton_wool/number_roll_cotton_wool_available": "OnMnXbQRKQW",
        "adequate_number_vials_mr_diluent/number_vials_mr_diluent_available": "hIwunU3MEvV",
        "adequate_number_vials_mr_vaccine/number_vials_mr_vaccine_available": "ta7W3NGG69X",
        "adequate_number_auto_disable_syringes/number_auto_disable_syringes_required": "dRobjlxCjrn",
        "adequate_number_auto_disable_syringes/number_auto_disable_syringes_available": "CPk3WC16omh",
        "adequate_number_aefi_line_listing_forms/number_aefi_line_listing_forms_required": "",
        "adequate_number_reconstitution_syringes/number_reconstitution_syringes_required": "qwdOvhK58Vk",
        "adequate_number_aefi_line_listing_forms/number_aefi_line_listing_forms_available": "",
        "adequate_number_reconstitution_syringes/number_reconstitution_syringes_available": "K6ZXImOVuQu"
    }

    const data = _.keys(list).map(k => {
        const dataElement = mapper[k];

        if (dataElement !== "") {
            return { dataElement, value: list[k] }
        }
        return null;
    }).filter(v => v !== null);
    console.log(data);

    return data;
}


export const opvDataValues = async (list, ous, period, attributeOptionCombo) => {
    const baseUrl = getDHIS2Url();
    const keys = {
        'list/target_population': {
            dataElement: 'qUPxGgvjxM0',
            period,
            categoryOptionCombo: 'HllvX50cXC0',
            attributeOptionCombo
        },
        'list/no_vaccine_vials_issued': {
            dataElement: 'zubJgvPKrm4',
            period,
            categoryOptionCombo: 'HllvX50cXC0',
            attributeOptionCombo
        },
        'list/chd_registered_months0_59': {
            dataElement: 'gfAMJ2FAwVh',
            period,
            categoryOptionCombo: 'HllvX50cXC0',
            attributeOptionCombo
        },
        'list/children_immunised/months0_59': {
            dataElement: 'H8oR202q4yu',
            period,
            categoryOptionCombo: 'HllvX50cXC0',
            attributeOptionCombo
        },
        'list/post_staffing/number_mobilizers': {
            dataElement: 'B5m1aCG4hnB',
            period,
            categoryOptionCombo: 'HllvX50cXC0',
            attributeOptionCombo
        },
        'list/no_vaccine_vials_returned_unopened': {
            dataElement: 'E3vsHXXvlOv',
            period,
            categoryOptionCombo: 'HllvX50cXC0',
            attributeOptionCombo
        },
        'list/post_staffing/number_health_workers': {
            dataElement: 'rFeC1QtV1bu',
            period,
            categoryOptionCombo: 'HllvX50cXC0',
            attributeOptionCombo
        },
        'list/children_immunised/first_ever_zero_dose': {
            dataElement: 'KB4JOwej4Iw',
            period,
            categoryOptionCombo: 'HllvX50cXC0',
            attributeOptionCombo
        },
        'list/no.vials_discarded_due_to/no_vials_discarded_other_factors': {
            dataElement: 'XkMW8pKRfed',
            period,
            categoryOptionCombo: 'E4wrUHavnxw',
            attributeOptionCombo
        },
        'list/no.vials_discarded_due_to/no_vials_discarded_due_contamination': {
            dataElement: 'XkMW8pKRfed',
            period,
            categoryOptionCombo: 'YuPxWTajxgw',
            attributeOptionCombo
        },
        'list/no.vials_discarded_due_to/no_vials_discarded_due_vvm_color_change': {
            dataElement: 'XkMW8pKRfed',
            period,
            categoryOptionCombo: 'w7BoUsyaywi',
            attributeOptionCombo
        },
        'list/no.vials_discarded_due_to/no_vials_discarded_due_partial_use': {
            dataElement: 'XkMW8pKRfed',
            period,
            categoryOptionCombo: 'DwzqPmIFldV',
            attributeOptionCombo
        }
    }
    let dataValues = list.map(l => {
        const post = String(l['list/name_of_post']).toLowerCase();
        const currentKeys = _.keys(l).filter(k => k !== 'list/name_of_post');
        const orgUnit = ous[post];
        if (orgUnit) {
            const current = currentKeys.map(k => {
                const value = l[k];
                let val = keys[k];
                if (val) {
                    val = { ...val, orgUnit, value }
                }
                return val;
            });
            return current
        } else {
            return [];
        }
    });
    dataValues = _.flatten(dataValues).filter(v => {
        return v && v !== null && v !== undefined
    });
    if (dataValues.length > 0) {
        await postAxios(`${baseUrl}/dataValueSets`, { dataValues });
    }
    return dataValues;
}

export const getDHIS2Url1 = (uri) => {
    if (uri !== '') {
        try {
            const url = new URL(uri);
            const dataURL = url.pathname.split('/');
            const apiIndex = dataURL.indexOf('api');

            if (apiIndex !== -1) {
                return url.href
            } else {
                if (dataURL[dataURL.length - 1] === "") {
                    return url.href + 'api';
                } else {
                    return url.href + '/api';
                }
            }
        } catch (e) {
            console.log(e);
            return e;
        }
    }
    return null
};

export const createDHIS2Auth = () => {
    const username = process.env.DHIS2_USER;
    const password = process.env.DHIS2_PASS;
    return { username, password }
};

export const getDHIS2Url = () => {
    const uri = process.env.DHIS2_URL;
    return getDHIS2Url1(uri);
};

export const postAxios = async (url, data) => {
    return axios.post(url, data, {
        auth: createDHIS2Auth()
    });
};

export const putAxios = async (url, data) => {
    return axios.put(url, data, {
        auth: createDHIS2Auth()
    });
};


export const getAxios = async (url, params = {}) => {
    return axios.get(url, {
        params,
        auth: createDHIS2Auth()
    })
};

export const pullOrganisationUnits = async (level, name) => {

    try {
        const baseUrl = getDHIS2Url();
        if (baseUrl) {
            const url = baseUrl + '/organisationUnits.json';
            const { data: { organisationUnits } } = await getAxios(url, {
                level,
                fields: 'id,name,code,parent[id,name,code],children[id,name,code,children[id,name,code]]',
                paging: false,
                filter: `name:ilike:${name}`
            });
            return organisationUnits
        }
    } catch (e) {
        winston.log('error', e.message);
    }

    return [];
};

export const truncateString = (str, num) => {
    if (String(str).length <= num) {
        return str
    }
    return String(str).slice(0, num) + '...'
}

export const searchPosts = async (subCounty, posts, parent = '', create = false) => {
    const baseUrl = getDHIS2Url();
    const openingDate = moment().subtract(1, 'years');

    let { data: { dataSets } } = await getAxios(`${baseUrl}/metadata.json`, { dataSets: true });
    let organisationUnits = dataSets.map(dataSet => dataSet.organisationUnits);
    organisationUnits = _.uniq(_.flatten(organisationUnits))

    if (create) {
        const ou = { shortName: truncateString(subCounty.name, 46), name: subCounty.name, id: subCounty.id, parent: { id: parent }, openingDate };
        await postAxios(`${baseUrl}/organisationUnits`, ou);
        await postAxios(`${baseUrl}/schemas/organisationUnit`, ou);
        subCounty = { ...subCounty, children: [] }
    }

    const { children } = subCounty;
    let data = {}
    let newOus = [];
    let realNew = [];
    try {
        for (const post of posts) {
            const search = children.find(p => {
                return String(post).toLowerCase() === String(p.name).toLowerCase();
            });
            if (search) {
                data = { ...data, [post.toLowerCase()]: search.id };
            } else {
                const id = generateUid();
                const ou = { shortName: truncateString(post, 46), name: post, id, parent: { id: subCounty.id }, openingDate };
                realNew = [...realNew, ou]
                data = { ...data, [String(post).toLowerCase()]: id };
            }
        }

        const values = _.values(data);

        values.forEach(v => {
            const f = organisationUnits.find(f => f.id === v);
            if (!f) {
                newOus = [...newOus, { id: v }];
            }
        });

        if (realNew.length > 0) {
            const response = await postAxios(`${baseUrl}/metadata`, { organisationUnits: realNew });
        }

        if (newOus.length > 0) {
            dataSets.map(dataSet => {
                dataSet.organisationUnits = [...dataSet.organisationUnits, ...newOus];
                return dataSet
            });
            await postAxios(`${baseUrl}/metadata`, { dataSets });
        }

        return data;
    } catch (error) {
        console.log('We found something');
        console.log(error.message);
    }
};

export const processDataSetResponses = (response) => {
    if (response['status'] === 'SUCCESS' || response['status'] === 'WARNING') {
        const { imported, deleted, updated, ignored } = response['importCount'];
        winston.log('info', ' imported: ' + imported + ', updated: ' + updated + ', deleted: ' + deleted);
        if (response['conflicts']) {
            response['conflicts'].forEach(c => {
                winston.log('warn', 'conflict found, object: ' + c.object + ', message: ' + c.value);
            });
        }
    } else if (response['httpStatusCode'] === 500) {
        winston.log('error', JSON.stringify(response, null, 2));
    }
};

export const processResponse = (response, type) => {
    if (response) {
        if (response['httpStatusCode'] === 200) {
            const { importSummaries } = response['response'];
            importSummaries.forEach(importSummary => {
                const { importCount, reference } = importSummary;
                winston.log('info', type + ' with id, ' + reference + ' imported: ' + importCount.imported + ', updated: ' + importCount.updated + ', deleted: ' + importCount.deleted);
            });
        } else if (response['httpStatusCode'] === 409) {
            _.forEach(response['response']['importSummaries'], (s) => {
                _.forEach(s['conflicts'], (conflict) => {
                    winston.log('warn', type + ' conflict found, object: ' + conflict.object + ', message: ' + conflict.value);
                });
            });
        } else if (response['httpStatusCode'] === 500) {
            winston.log('error', JSON.stringify(response, null, 2));
        }
    }
};

export const processEventUpdate = (successes) => {
    successes.forEach(s => {
        processDataSetResponses(s, 'event');
    })
};

export const whatToComplete = (processed, dataSet) => {
    const p = processed.dataValues.map(d => {
        return _.pick(d, ['orgUnit', 'period']);
    });

    return _.uniqWith(p, _.isEqual).map(p => {
        return { dataSet: dataSet, organisationUnit: p.orgUnit, period: p.period }
    });
};

export const findType = (query) => {
    if (query === 'regions') {
        return { disaggregation: 'districts', search: 'region' };
    } else if (query === 'districts') {
        return { disaggregation: 'subcounty', search: 'districts' }
    } else if (query === 'subcounties') {
        return { disaggregation: 'list/name_of_post', search: 'subcounty' }
    } else {
        return { disaggregation: 'region' }
    }
}
