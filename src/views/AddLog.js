import React, { useEffect, useState } from "react";
import PT_BUTTON from "../components/buttons/PT_BUTTON";
import PT_MODAL from "../components/modals/PT_MODAL";
import PT_INPUT from "../components/inputs/PT_INPUT";
import Grid from "@material-ui/core/Grid";
import MomentUtils from "@date-io/moment";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";

import { Form, FormGroup, Label, Input, FormText } from "reactstrap";

import APIManager from "../modules/APIManager";
import * as firebase from "firebase";
import * as moment from "moment";

const AddLog = ({
  userData,
  userInfo,
  history,
  isOnPeriod,
  clickedPeriodLog,
  cycles,
  currentCycle,
  periodButton
}) => {
  const [moods, setMoods] = useState([]);
  const [flows, setFlows] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [noteLog, setNoteLog] = useState(null);
  const [logDate, setLogDate] = useState(moment().format("MM/DD/YYYY"));
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [logIds, setLogIds] = useState({});
  const [openDraftModal, setOpenDraftModal] = useState(false);
  const [openEndPeriodModal, setOpenEndPeriodModal] = useState(false);
  const [endPeriodContent, setEndPeriodContent] = useState({
    header: "",
    main: ""
  });

  firebase
    .database()
    .ref("mood_types")
    .on("child_changed", snapshot => {
      getMoods();
    });

  firebase
    .database()
    .ref("flow_types")
    .on("child_changed", snapshot => {
      getFlows();
    });

  const getMoods = () => {
    APIManager.getResource("mood_types").then(data => {
      const newArray = [];

      for (let moodId in data) {
        newArray.push({ name: data[moodId].name, id: moodId });
      }
      setMoods(newArray);
    });
  };

  const getFlows = () => {
    APIManager.getResource("flow_types").then(data => {
      const newArray = [];
      for (let moodId in data) {
        newArray.push({ name: data[moodId].name, id: moodId });
      }
      setFlows(newArray);
    });
  };

  const getDrafts = () => {
    APIManager.getDrafts(userData.uid, "mood_logs")
      .then(data => {
        const newObj = { ...drafts };
        if (Object.keys(data).length > 0) {
          newObj.mood_logs = data;
        }
        return newObj;
      })
      .then(newObj => {
        APIManager.getDrafts(userData.uid, "note_logs")
          .then(data => {
            if (Object.keys(data).length) {
              newObj.note_logs = data;
            }
            return newObj;
          })
          .then(newObj => {
            APIManager.getDrafts(userData.uid, "flow_logs")
              .then(data => {
                if (Object.keys(data).length) {
                  newObj.flow_logs = data;
                }
                return newObj;
              })
              .then(newObj => {
                setOpenDraftModal(true);
                setDrafts(newObj);
              });
          });
      });
  };

  const updateMoodLog = () => {};

  const updateCycle = () => {
    const newObj = { ...currentCycle.cycleData };
    newObj.period_end = moment().format("YYYY-MM-DD");

    APIManager.updateCycle(userData.uid, currentCycle.cycleId, newObj);
  };

  const handleEndPeriodModal = e => {
    if (e.target.value === "submit") {
      updateCycle();
      setOpenEndPeriodModal(false);
    } else {
      // delete period log
      // update current cycle
    }
  };

  const handleDraftModal = e => {
    if (e.target.name === "cancel") {
      for (let type in drafts) {
        APIManager.deleteLog(type, userData.uid, Object.keys(drafts[type])[0]);
      }
      setOpenDraftModal(false);
      setLogIds({});
    } else if (e.target.name === "submit") {
      const draftIds = {};
      for (let type in drafts) {
        if (type === "mood_logs") {
          setSelectedMood(
            drafts[type][Object.keys(drafts[type])[0]].mood_typeId
          );

          draftIds.mood_logs = Object.keys(drafts[type])[0];
        } else if (type === "note_logs") {
          setNoteLog(drafts[type][Object.keys(drafts[type])[0]].content);
          draftIds.note_logs = Object.keys(drafts[type])[0];
        } else if (type === "flow_logs") {
          setSelectedFlow(
            drafts[type][Object.keys(drafts[type])[0]].flow_typeId
          );
          draftIds.flow_logs = Object.keys(drafts[type])[0];
        }
      }
      setLogIds(draftIds);
    }
    setOpenDraftModal(false);
  };

  const makeKey = ref => {
    return firebase
      .database()
      .ref()
      .child("child")
      .push().key;
  };

  const handleChange = e => {
    let ref;
    let obj;
    if (moment.isMoment(e)) {
      console.log(e.format("MM/DD/YYYY"));

      setLogDate(e.format("MM/DD/YYYY"));
    } else if (e.target.value === "" && e.target.id !== "note-area") {
      if (logIds[e.target.name.split("-")[0] + "_logs"] !== undefined) {
        APIManager.deleteLog(
          e.target.name.split("-")[0] + "_logs",
          userData.uid,
          logIds[e.target.name.split("-")[0] + "_logs"]
        );

        delete logIds[e.target.name.split("-")[0] + "_logs"];
      }
      if (e.target.name.split("-")[0] == "mood") {
        setSelectedMood("");
      } else if (e.target.name.split("-")[0] == "flow") {
        setSelectedFlow("");
      }
      // setSelectedMood("")
    } else if (e.target.name === "flow-type") {
      if (logIds.flow_logs) {
        ref = `flow_logs/${userData.uid}/${logIds.flow_logs}`;
        obj = { flow_typeId: e.target.value };
      } else {
        const key = makeKey();

        ref = `flow_logs/${userData.uid}/${key}`;

        obj = {
          flow_typeId: e.target.value,
          date: moment().format("YYYY-MM-DD"),
          isDraft: true
        };

        const newObj = { ...logIds };
        newObj.flow_logs = key;
        setLogIds(newObj);
      }

      setSelectedFlow(e.target.value);
    } else if (e.target.name === "mood-type") {
      if (logIds.mood_logs) {
        ref = `mood_logs/${userData.uid}/${logIds.mood_logs}`;
        obj = { mood_typeId: e.target.value };
      } else {
        const key = makeKey();

        ref = `mood_logs/${userData.uid}/${key}`;

        obj = {
          mood_typeId: e.target.value,
          date: moment().format("YYYY-MM-DD"),
          isDraft: true
        };

        const newObj = { ...logIds };
        newObj.mood_logs = key;
        setLogIds(newObj);
      }
      setSelectedMood(e.target.value);
    } else if (e.target.id === "note-area") {
      if (logIds.note_logs) {
        ref = `note_logs/${userData.uid}/${logIds.note_logs}`;
        obj = { content: e.target.value };
      } else {
        const key = makeKey();

        ref = `note_logs/${userData.uid}/${key}`;

        obj = {
          content: e.target.value,
          date: moment().format("YYYY-MM-DD"),
          isDraft: true
        };

        const newObj = { ...logIds };
        newObj.note_logs = key;
        setLogIds(newObj);
      }
      setNoteLog(e.target.value);
    } else if (e.target.name === "add-log") {
      for (let id in logIds) {
        APIManager.updateLog(`${id}/${userData.uid}/${logIds[id]}`, {
          isDraft: false,
          date: logDate
        });
      }

      history.push("/");
    } else if (e.target.name === "cancel-log") {
      for (let id in logIds) {
        APIManager.deleteLog(id, userData.uid, logIds[id]);
      }
      history.push("/");
    } else if (e.target.name === "start-period") {
      // Calculate averages then do all this.
      const key = makeKey();
      ref = `cycles/${userData.uid}/${key}`;

      if (moment().isBefore(currentCycle.cycleData.cycle_end, "days")) {
        APIManager.updateCycle(userData.uid, currentCycle.cycleId, {
          cycle_end: moment()
            .subtract(1, "days")
            .format("YYYY-MM-DD")
        });
      }
      if (userInfo.averagePeriodDays > 0) {
        obj = {
          period_start: moment().format("YYYY-MM-DD"),
          period_end: moment()
            .add(userInfo.averagePeriodDays, "days")
            .format("YYYY-MM-DD"),
          cycle_end: moment()
            .add(userInfo.averageCycleDays, "days")
            .format("YYYY-MM-DD")
        };
      } else {
        obj = {
          period_start: moment().format("YYYY-MM-DD"),
          period_end: moment()
            .add(5, "days")
            .format("YYYY-MM-DD"),
          cycle_end: moment()
            .add(28, "days")
            .format("YYYY-MM-DD")
        };

        APIManager.updateUser(
          { averagePeriodDays: 5, averageCycleDays: 28 },
          userData.uid
        );
      }
    } else if (e.target.name === "end-period") {
      if (
        currentCycle.cycleData.period_start === moment().format("YYYY-MM-DD")
      ) {
        setEndPeriodContent({
          header:
            "You already logged a period today! Did you want to delete this period?"
        });
        setOpenEndPeriodModal(true);
      }
    }

    if (
      !moment.isMoment(e) &&
      e.target.name !== "add-log" &&
      e.target.name !== "cancel-log" &&
      e.target.name !== "logDate" &&
      e.target.name !== "end-period" &&
      e.target.value !== ""
    ) {
      APIManager.updateLog(ref, obj);
    }
  };

  useEffect(() => {}, [isOnPeriod]);

  useEffect(() => {
    getMoods();
    getFlows();
    getDrafts();
  }, []);

  return (
    <>
      <div className="log-page">
        {Object.keys(drafts).length > 0 && (
          <PT_MODAL
            content={{
              modalHeader: "You have a saved draft",
              mainText: (
                <>
                  {drafts.mood_logs && "mood "}
                  {drafts.flow_logs && "flow "}
                  {drafts.note_logs && "note "}
                  <hr />
                  <p>Would you like to continue or delete this draft?</p>
                </>
              )
            }}
            isOpen={openDraftModal}
            actionItems={["edit", "delete"]}
            handleAction={handleDraftModal}
          />
        )}
        <div className="log-page-title">
          <h1>Add a Log</h1>
        </div>
        <div className="log-item">
          <h3 className="log-item-title">How are you feeling?</h3>
          <div className="log-item-buttons">
            <PT_BUTTON
              key="clear-mood"
              content="clear"
              value=""
              type="circular"
              active={"" === selectedMood}
              handleClick={handleChange}
              name="mood-type"
            />
            {moods.map(item => (
              <PT_BUTTON
                key={item.id}
                content={item.name}
                value={item.id}
                type="circular"
                active={item.id === selectedMood}
                handleClick={handleChange}
                name="mood-type"
              />
            ))}
          </div>
        </div>
        <hr />
        <div className="log-item">
          <h3 className="log-item-title">How is you're flow?</h3>
          <div className="log-item-buttons">
            <PT_BUTTON
              key="clear-flow"
              content="no flow"
              value=""
              name="flow-type"
              type="circular"
              active={"" === selectedFlow}
              handleClick={handleChange}
            />
            {flows.map(item => (
              <PT_BUTTON
                key={item.id}
                content={item.name}
                value={item.id}
                name="flow-type"
                type="circular"
                active={item.id === selectedFlow}
                handleClick={handleChange}
              />
            ))}
          </div>
        </div>
        <hr />
        <div className="log-item">
          <h3 className="log-item-title">Anything else you want to log?</h3>
          <PT_INPUT
            type="textarea"
            inputId="note-area"
            handleChange={handleChange}
            valueFromState={noteLog}
            className="log-item-input"
          />
        </div>
        <hr />
        <div className="log-item">
          <div className="log-item-date">
            <label htmlFor="logDate" className="log-item-title">
              Log Date
            </label>
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <DatePicker
                autoOk
                disableFuture
                onChange={handleChange}
                value={logDate}
                label="date for log"
                variant="inline"
                format="MMM DD, YYYY"
                margin="normal"
                id="date-picker-inline"
                animateYearScrolling
              />
            </MuiPickersUtilsProvider>
          </div>
        </div>
        <div className="log-item-buttons-actions">
          <PT_BUTTON
            key="cancel"
            content="Cancel"
            value="cancel-log"
            name="cancel-log"
            type="circular"
            handleClick={handleChange}
          />

          <PT_BUTTON
            key="submit"
            content="Save"
            value="add-log"
            name="add-log"
            type="circular"
            disabled={
              (selectedMood === null || selectedMood === "") &
              (selectedFlow === null || selectedFlow === "") &
              (noteLog === null || noteLog === "")
                ? true
                : false
            }
            handleClick={handleChange}
          />
        </div>
      </div>
    </>
  );
};

export default AddLog;
