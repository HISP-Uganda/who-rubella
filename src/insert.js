if (district && district.length === 1) {

    let { data: { dataSets } } = await getAxios(`${baseUrl}/metadata.json`, { dataSets: true });

    let organisationUnits = dataSets.map(dataSet => dataSet.organisationUnits);
    organisationUnits = uniq(flatten(organisationUnits));

    let currentSubCounties = {};

    const subCounties = district[0].children;


    const processed = payload.map(({ list, date_of_results, _id, day_of_results, _version, subcounty, districts, region, other_subcountyvisited, ...rest }) => {
        if (subcounty === 'OTHERS') {
            subcounty = other_subcountyvisited;
        }

        const subCounty = String(subcounty).split('_').join(' ').replace(/\\n/g, '').trim().toLowerCase().split(' ').map(w => {
            return w[0].toUpperCase() + w.slice(1)
        }).join(' ');

        districts = district[0].id
        region = district[0].parent.id;

        let foundSubCounty = currentSubCounties[subCounty];

        if (!foundSubCounty) {
            foundSubCounty = subCounties.find(s => {
                return s.name === subCounty;
            });
            if (foundSubCounty) {
                currentSubCounties = { ...currentSubCounties, [subCounty]: foundSubCounty }
            } else {
                const id = generateUid();
                foundSubCounty = { shortName: truncateString(subCounty, 46), name: subCounty, id, parent: { id: districts }, openingDate };
                newSubCounties = [...newSubCounties, foundSubCounty];
                foundSubCounty = { ...foundSubCounty, children: [] }
                currentSubCounties = { ...currentSubCounties, [subCounty]: foundSubCounty }
            }
        }

        const posts = list.map(l => {

            let p = l['list/name_of_post'] || l['list/name_of_post_visited'];
            const post = String(p).split('_').join(' ').replace(/\\n/g, '').trim().toLowerCase().split(' ').filter(w => w && w !== '').map(w => {
                return w[0].toUpperCase() + w.slice(1)
            }).join(' ');

            let foundPost = foundSubCounty.children.find(p => {
                return post === p.name;
            });

            if (!foundPost) {
                const id = generateUid();
                foundPost = { shortName: truncateString(post, 46), name: post, id, parent: { id: foundSubCounty.id }, openingDate };
                newPosts = [...newPosts, foundPost];
                foundSubCounty = { ...foundSubCounty, children: [...foundSubCounty.children, foundPost] }
            }
        })

        if (isArray(list)) {
            const processedList = list.map(l => {

                let p = l['list/name_of_post'] || l['list/name_of_post_visited'];
                const post = String(p).split('_').join(' ').replace(/\\n/g, '').trim().toLowerCase().split(' ').filter(w => w && w !== '').map(w => {
                    return w[0].toUpperCase() + w.slice(1)
                }).join(' ');

                let foundPost = foundSubCounty.children.find(p => {
                    return post === p.name;
                });

                if (!foundPost) {
                    const id = generateUid();
                    foundPost = { shortName: truncateString(post, 46), name: post, id, parent: { id: foundSubCounty.id }, openingDate };
                    newPosts = [...newPosts, foundPost];
                    foundSubCounty = { ...foundSubCounty, children: [...foundSubCounty.children, foundPost] }
                }

                const y35 = parseInt(l['list/children_vaccinated/years3_5'], 10);
                const y614 = parseInt(l['list/children_vaccinated/years6_14'], 10);
                const y911 = parseInt(l['list/children_vaccinated/months9_11'], 10);
                const y1224 = parseInt(l['list/children_vaccinated/months12_24'], 10);
                const total = y35 + y614 + y911 + y1224;

                const partialUse = parseInt(l['list/mr_vaccine_usage/no_vials_discarded_due_partial_use'], 10);
                const contamination = parseInt(l['list/mr_vaccine_usage/no_vials_discarded_due_contamination'], 10);
                const otheFactors = parseInt(l['list/mr_vaccine_usage/no_vials_discarded_other_factors'], 10);
                const colorChange = parseInt(l['list/mr_vaccine_usage/no_vials_discarded_due_vvm_color_change'], 10);
                const unopen = parseInt(l['list/mr_vaccine_usage/no_vaccine_vials_returned_unopened'], 10);

                allPosts = [...allPosts, { id: foundPost.id }]

                const discarded = partialUse + contamination + otheFactors + colorChange;
                return {
                    ...l,
                    ['list/children_vaccinated/total']: isNaN(parseInt(total)) ? 0 : total,
                    ['list/mr_vaccine_usage/no_vials_discarded']: isNaN(parseInt(discarded, 10)) ? 0 : discarded,
                    ['list/name_of_post']: foundPost.id,
                    ['list/mr_vaccine_usage/no_vials_discarded_due_partial_use']: isNaN(partialUse) ? 0 : partialUse,
                    ['list/mr_vaccine_usage/no_vials_discarded_due_contamination']: isNaN(contamination) ? 0 : contamination,
                    ['list/mr_vaccine_usage/no_vials_discarded_other_factors']: isNaN(otheFactors) ? 0 : otheFactors,
                    ['list/mr_vaccine_usage/no_vials_discarded_due_vvm_color_change']: isNaN(colorChange) ? 0 : colorChange,
                    ['list/children_vaccinated/months12_24']: isNaN(y35) ? 0 : y35,
                    ['list/children_vaccinated/years6_14']: isNaN(y614) ? 0 : y614,
                    ['list/children_vaccinated/months9_11']: isNaN(y911) ? 0 : y911,
                    ['list/children_vaccinated/months12_24']: isNaN(y1224) ? 0 : y1224,
                    ['list/mr_vaccine_usage/no_vaccine_vials_returned_unopened']: isNaN(unopen) ? 0 : unopen,
                    ...rest,
                    subcounty: foundSubCounty.id,
                    districts,
                    region,
                    date_of_results: moment(date_of_results).format('YYYYMMDD'),
                    day_of_results: getCOC(day_of_results),
                    other_subcountyvisited
                }
            });
            return processedList;
        }
        return [];
    });

    const allData = flatten(processed);

    if (newSubCounties.length > 0) {
        await postAxios(`${baseUrl}/metadata`, { organisationUnits: newSubCounties });
    }
    if (newPosts.length > 0) {
        await postAxios(`${baseUrl}/metadata`, { organisationUnits: newPosts });
    }
    const finalOus = unionBy(organisationUnits, allPosts, 'id');
    const finalDataSets = dataSets.map(dataSet => {
        return { ...dataSet, organisationUnits: finalOus }
    });
    await postAxios(`${baseUrl}/metadata`, { finalDataSets });
    await mrDataValues(allData);
    const body = allData.flatMap(doc => [{ index: { _index: 'rubella' } }, doc]);
    const { body: bulkResponse } = await client.bulk({ refresh: true, body });
    response = bulkResponse
    io.emit('data', { message: 'data has come' });
} else {
    console.log(district)
}