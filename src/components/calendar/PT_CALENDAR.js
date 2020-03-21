import React, { useState, useEffect } from "react";
import * as moment from "moment";
import { Grid } from "semantic-ui-react";
import { Link } from "react-router-dom";
import PT_CARD from "../cards/PT_CARD";

const PT_CALENDAR = ({
  date,
  highlight = [],
  groupClass,
  handleClick,
  endPeriodDay = [],
  startPeriodDay = []
}) => {
  const [daySquares, setDaySquares] = useState(["square"]);
  const [dayGrid, setDayGrid] = useState(["monday"]);
  const [month, setMonth] = useState("");

  useEffect(() => {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];

    const days = moment(date, "YYYY-MM").daysInMonth();

    const startDay = dayNames.indexOf(
      moment(date, "YYYY-MM")
        .startOf("month")
        .format("dddd")
    );

    let newArray = [];

    for (let i = 1; i <= startDay; i++) {
      newArray.push(<Grid.Column key={i}>{``}</Grid.Column>);
    }

    for (let i = 1; i <= days; i++) {
      let touched = false;

      startPeriodDay.forEach((element, j) => {
        if (i >= startPeriodDay[j] && i <= endPeriodDay[j]) {
          newArray.push(
            <Grid.Column
              textAlign={"center"}
              verticalAlign={"middle"}
              className="grid-background-color calendar-number-square"
              key={i + 7}
            >
              <div
                onClick={e => handleClick(e, date + `-${i < 10 ? "0" + i : i}`)}
              >{`${i}`}</div>
            </Grid.Column>
          );
          touched = true;
        }
      });

      if (!touched) {
        newArray.push(
          <Grid.Column
            textAlign={"center"}
            verticalAlign={"middle"}
            className="calendar-number-square"
            key={i + 7}
          >
            <div
              onClick={e => handleClick(e, date + `-${i < 10 ? "0" + i : i}`)}
            >{`${i}`}</div>
          </Grid.Column>
        );
      }
    }

    let newDayGridArray = [];
    for (var i = 0; i < dayNames.length; i++) {
      newDayGridArray.push(
        <Grid.Column
          textAlign={"center"}
          verticalAlign={"middle"}
          className="calendar-name-square"
          key={dayNames[i]}
        >{`${dayNames[i].slice(0, 3)}`}</Grid.Column>
      );
    }
    setDayGrid(newDayGridArray);
    setDaySquares(newArray);
  }, []);

  return (
    <PT_CARD
      cardArray={[
        {
          // href: `#card-${moment(date, "YYYY-MM").format("MMMM").toLowerCase()}`,
          children: (
            <div className="calendar-container">
              <h1>{moment(date, "YYYY-MM").format("MMMM YYYY")}</h1>
              <Grid columns={7} celled="internally" padded>
                <Grid.Row>{dayGrid.map(square => square)}</Grid.Row>

                <Grid.Row>{daySquares.map(square => square)}</Grid.Row>
              </Grid>
            </div>
          )
        }
      ]}
      indiv={false}
      groupClass={groupClass}
    />
  );
};

export default PT_CALENDAR;
