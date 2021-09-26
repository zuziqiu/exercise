export const useSchedule = {
  running: false,
  useScheduleList: [],
  useAddSchedule(callBack) {
    this.useScheduleList.push(callBack)
  },
  useRunSchedule() {
    let callBack = this.useScheduleList.splice(0, 1)
    callBack[0] && callBack[0]()
  }
}