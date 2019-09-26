import Schedule from './ScheduleModel';

const ScheduleController = {
    /**
     *
     * @param {object} req
     * @param {object} res
     * @returns {object} schedule object
     */
    create(req, res) {
        const schedule = Schedule.create(req.body);
        return res.status(201).send(schedule);
    },

};

export default ScheduleController;
