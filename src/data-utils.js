import _ from "lodash";
import axios from 'axios';
import dotenv from "dotenv";
import winston from './winston';
import { generateUid } from './uid';
import moment from 'moment';

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
        'list/other_factor_specify': {
            dataElement: 'T05lrtJZwYT',
            period,
            categoryOptionCombo: 'HllvX50cXC0',
            attributeOptionCombo
        },
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
    if (str.length <= num) {
        return str
    }
    return str.slice(0, num) + '...'
}

export const searchPosts = async (subCounty, posts) => {
    const baseUrl = getDHIS2Url();
    const { children } = subCounty;
    let data = {}
    let newOus = [];

    const openingDate = moment().subtract(1, 'years');
    try {
        let { data: { dataSets } } = await getAxios(`${baseUrl}/metadata.json`, { dataSets: true });
        let organisationUnits = dataSets.map(dataSet => dataSet.organisationUnits);
        organisationUnits = _.uniq(_.flatten(organisationUnits))
        for (const post of posts) {
            const search = children.find(p => {
                return post.toLowerCase() === p.name.toLowerCase();
            });
            if (search) {
                data = { ...data, [post.toLowerCase()]: search.id };
            } else {
                const id = generateUid();
                const ou = { shortName: truncateString(post, 46), name: post, id, parent: { id: subCounty.id }, openingDate };
                await postAxios(`${baseUrl}/organisationUnits`, ou);
                await postAxios(`${baseUrl}/schemas/organisationUnit`, ou);
            }
        }

        const values = _.values(data);


        values.forEach(v => {
            const f = organisationUnits.find(f => f.id === v);
            if (!f) {
                newOus = [...newOus, { id: v }];
            }
        })
        if (newOus.length > 0) {
            dataSets.map(dataSet => {
                dataSet.organisationUnits = [...dataSet.organisationUnits, ...newOus];
                return dataSet
            });
            await postAxios(`${baseUrl}/metadata`, { dataSets });
        }
    } catch (error) {
        console.log(error)
    }
    return data;
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
