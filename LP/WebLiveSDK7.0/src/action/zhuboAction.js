import { action, set } from "mobx";
import * as TYPES from "./action-types";

export class zhuboAction {
  constructor(store) {
    this.store = store.zhubo;
  }
  dispatch(action) {
    this.zhubo(this.store, action);
  }

  @action zhubo(state, action) {
    switch (action.type) {
      case TYPES.MERGE_STATE: {
        Object.assign(state, action.payload);
        break;
      }
      case TYPES.UPDATE_BID: {
        state.bid = action.payload;
        break;
      }
      case TYPES.UPDATE_CONTENT_SCORE: {
        state.contentScore = action.payload;
        break;
      }
      case TYPES.UPDATE_DEPARTMENT_I_D: {
        state.departmentID = action.payload;
        break;
      }
      case TYPES.UPDATE_EFFECT_SCORE: {
        state.effectScore = action.payload;
        break;
      }
      case TYPES.UPDATE_FLOWER: {
        state.flower = action.payload;
        break;
      }
      case TYPES.UPDATE_INFO: {
        state.info = action.payload;
        break;
      }
      case TYPES.UPDATE_INTRO: {
        state.intro = action.payload;
        break;
      }
      case TYPES.UPDATE_METHOD_SCORE: {
        state.methodScore = action.payload;
        break;
      }
      case TYPES.UPDATE_NICKNAME: {
        state.nickname = action.payload;
        break;
      }
      case TYPES.UPDATE_P_40: {
        state.p_40 = action.payload;
        break;
      }
      case TYPES.UPDATE_P_150: {
        state.p_150 = action.payload;
        break;
      }
      case TYPES.UPDATE_P_260: {
        state.p_260 = action.payload;
        break;
      }
      case TYPES.UPDATE_PARTNER_ID: {
        state.partner_id = action.payload;
        break;
      }
      case TYPES.UPDATE_PORTRAIT_UPDATE: {
        state.portraitUpdate = action.payload;
        break;
      }
      case TYPES.UPDATE_ROLE: {
        state.role = action.payload;
        break;
      }
      case TYPES.UPDATE_SCORE_CONFIG: {
        state.scoreConfig = action.payload;
        break;
      }
      case TYPES.UPDATE_SCORE_ICON: {
        state.scoreIcon = action.payload;
        break;
      }
      case TYPES.UPDATE_SCORE_NUM: {
        state.scoreNum = action.payload;
        break;
      }
      case TYPES.UPDATE_SCORE_TOTAL: {
        state.scoreTotal = action.payload;
        break;
      }
      case TYPES.UPDATE_SCORE_TYPE: {
        state.scoreType = action.payload;
        break;
      }
      case TYPES.UPDATE_SHOW_SCORE: {
        state.showScore = action.payload;
        break;
      }
      case TYPES.UPDATE_SID: {
        state.sid = action.payload;
        break;
      }
      case TYPES.UPDATE_STATUS: {
        state.status = action.payload;
        break;
      }
    }
  }
}
