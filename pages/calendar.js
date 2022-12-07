import Head from 'next/head'
import Image from 'next/image'
import calendarstyles from '../styles/Calendar.module.css'
import loadingstyles from '../styles/Loading.module.css'
import React, { useEffect, useRef, useLayoutEffect, useState, useCallback } from "react";
import axios from 'axios'

let stdid, pwd;
let errcnt = 0;
let calendarLoad = 0;

const slideRef = React.createRef();

function checkLeapYear(year) {
    if (year%400 == 0) {
      return true;
    } else if (year%100 == 0) {
      return false;
    } else if (year%4 == 0) {
      return true;
    } else {
      return false;
    }
}

function getFirstDayOfWeek(year, month){
  let monthStr = ""+month
  if (month < 10) monthStr = "0" + month;
  return (new Date(year + "-" + monthStr + "-01")).getDay();
}

function getCalendarDateContext(year, month){
  let arrCalendar=[];
  let month_day=[31,28,31,30,31,30,31,31,30,31,30,31]
  if (month == 2){
    if (checkLeapYear(year))month_day[1] = 29;
  }
  let first_day_of_week= getFirstDayOfWeek(year, month);
  let arrCalendarItem=[];
  for(let i = 0; i < first_day_of_week; i++){
    arrCalendarItem.push("");
    if(arrCalendarItem.length == 7) {
      arrCalendar.push(arrCalendarItem.slice());
      arrCalendarItem.splice(0);
    }
  }

  for(let i = 1; i <= month_day[month-1]; i++){
    arrCalendarItem.push(String(i));
    if(arrCalendarItem.length == 7) {
      arrCalendar.push(arrCalendarItem.slice());
      arrCalendarItem.splice(0);
    }
  }

  let remain_day = 7 - (arrCalendarItem.length%7);
  if(remain_day < 7){
    for(let i = 0; i < remain_day; i++){
      arrCalendarItem.push("");
      if(arrCalendarItem.length == 7) {
        arrCalendar.push(arrCalendarItem.slice());
        arrCalendarItem.splice(0);
      }
    }
  }

  return arrCalendar;
}

const getCalendarDay = () => {
  const names = ["일", "월", "화", "수", "목", "금", "토"];
  const calendarDay = names.map((day, idx) => {
    if(idx == 0) return <h5 key={idx} className={calendarstyles.sun}>{day}</h5>
    else if(idx == 6) return <h5 key={idx} className={calendarstyles.sat}>{day}</h5>
    else return <h5 key={idx}>{day}</h5>
  });

  return (
    <div className={calendarstyles.calendar_day}>
      {calendarDay}
    </div>
  )
}

export default function Calendar() {

  const calendarDay = getCalendarDay();

  let now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear()); //현재 선택된 연도
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()+1); //현재 선택된 달
  const [calendarList, setCalendarList] = useState([]);
  const [userData, setUserData] = useState({
    stdid: "",
    pwd: "",
  })

  const dateTotalCount = new Date(selectedYear, selectedMonth, 0).getDate(); //선택된 연도, 달의 마지막 날짜

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    for(const param of searchParams) {
      if(param[0] == 'stdid') {
        stdid = param[1]
      }
      if(param[0] == 'pwd') {
        pwd = param[1]
      }
    }

    getCalendarList();
  }, [])

  useEffect(() => {
    const slideHeight = slideRef && slideRef.current && slideRef.current.offsetHeight;
    if (typeof window !== "undefined")
      window.parent.postMessage({ head: "changeHeight", body: {view: "Calendar", height: slideHeight } }, '*');
  });
  
  const getCalendarList = () => {
    const getApi = async () => {
      const REQ_URL = process.env.FRONT_BASE_URL+"/backapi/calendar?studentId="+stdid
      let data
      console.log(REQ_URL)
      
      await axios.get(
        REQ_URL
      ).then((response) => {
        data = response.data
        console.log(data)
        calendarLoad = 1;
      }).catch((error) => {
        console.log(error.response)
        errcnt++
        if(errcnt >= 3) {
          window.location.href=process.env.FRONT_BASE_URL+'/errorPage?error='+error.response.status;
        }
      });

      setCalendarList(data)
    }
    getApi();
  }

  const changeYearPrev = useCallback(() => {
    setSelectedYear(selectedYear - 1);
  }, [selectedYear]);

  const changeYearNext = useCallback(() => {
    setSelectedYear(selectedYear + 1);
  }, [selectedYear]);

  const calendarMonth = useCallback(() => {
    //달 선택박스에서 고르기
    let monthOption = [];
    for(let i = 1; i <= 12; i++) {
      monthOption.push(
        <option key={i} value={i}>{i+"월"}</option>
      );
    }

    return (
      <select onChange={changeSelectMonth} name="month" id="monthSelect" value={selectedMonth}>
        {monthOption}
      </select>
    )
  }, [selectedMonth]);

  const changeSelectMonth = (e) => {
    setSelectedMonth(Number(e.target.value));
  };

  const openCalendarItem = (date, lectureList, scheduleList) => {
    if (typeof window !== "undefined")
      window.parent.postMessage({
        head: "showSchedule",
        body: {
          year: selectedYear,
          month: selectedMonth,
          day: parseInt(date),
          lectureList: lectureList,
          scheduleList: scheduleList,
        }
      }, '*');
  }

  const calendarDate = useCallback(() => {
    let calendarDate = getCalendarDateContext(selectedYear, selectedMonth);
  
    const celendarDateComponent = calendarDate.map((dateLine, idx1) => {
      const calendarDateLine = dateLine.map((date, idx2) => {
        let calendarListComponent = [];

        let calendarDTOList = [];
        let examScheduleDTOList = [];
      
        if(calendarList.length != 0) {
          let keyIdx = 0
          for(let i = 0; i < calendarList.calendarDTO.length; i++) {
            if(calendarList.calendarDTO[i].endDate == (selectedYear+"-"+('00' + selectedMonth).slice(-2)+"-"+('00' + date).slice(-2))) {
              
              calendarDTOList.push(calendarList.calendarDTO[i])
              calendarListComponent.push(
                <p key={keyIdx++}>{"💻"+calendarList.calendarDTO[i].title}</p>
              )
            }
          }
          for(let i = 0; i < calendarList.examScheduleDTO.length; i++) {
            if(calendarList.examScheduleDTO[i].date == (selectedYear+"-"+('00' + selectedMonth).slice(-2)+"-"+('00' + date).slice(-2))) {
              
              examScheduleDTOList.push(calendarList.examScheduleDTO[i])
              calendarListComponent.push(
                <p key={keyIdx++}>{"✨"+calendarList.examScheduleDTO[i].title}</p>
              )
            }
          }
        }

        return (
          <td key={idx1+""+idx2} onClick={()=>{
            openCalendarItem(date, calendarDTOList, examScheduleDTOList)
          }}>
            <h6 className={idx2 == 0?calendarstyles.sun:idx2==6?calendarstyles.sat:""}>
              {date}
            </h6>
            <div>
              {calendarListComponent}
            </div>
          </td>
        )
      });
      
      return <tr key={idx1}>{calendarDateLine}</tr>
    });
    
    if(!calendarLoad) return (
      <div className={loadingstyles.main}>
        <div className={loadingstyles.square}>
          <div className={loadingstyles.spin}></div>
        </div>
      </div>
    )
    else return (
      <table className={calendarstyles.calendar_date}>
        <tbody>
          {celendarDateComponent}
        </tbody>
      </table>
    )
  }, [selectedYear, selectedMonth, dateTotalCount, calendarList, userData]);
  
  const addScheduleShow = () => {
    if (typeof window !== "undefined")
      window.parent.postMessage({ head: "addSchedule", body: { year: selectedYear, month: selectedMonth } }, '*');
  }

  return (
    <div ref={slideRef}>
      <Head>
        <title>LMSSU</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className={calendarstyles.calendar_board}>
          <div className={calendarstyles.calendar_title}>
            <div className={calendarstyles.calendar_title_year}>
              <h5 onClick={changeYearPrev}>{"<"}</h5>
              <div>
                <h3>{selectedYear}</h3>
                <h5>학년도</h5>
              </div>
              <h5 onClick={changeYearNext}>{">"}</h5>
            </div>
            <div className={calendarstyles.calendar_title_contour}></div>
            <div className={calendarstyles.calendar_title_month}>
              {calendarMonth()}
            </div>
            <div className={calendarstyles.calendar_title_contour}></div>
            <div className={calendarstyles.calendar_title_schedule}>
              <div className={calendarstyles.calendar_title_schedule_btn} onClick={() => addScheduleShow()}>
                <h5>시험일정 추가</h5>
              </div>
            </div>
          </div>
          <div className={calendarstyles.calendar_board_contour}></div>
          <div className={calendarstyles.calendar_context}>
            {calendarDay}
            {calendarDate()}
          </div>
        </div>
      </main>
    </div>
  )
}
