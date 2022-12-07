import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import headerstyles from '../styles/Header.module.css'
import React, { useCallback, useEffect, useState } from "react";
import axios from 'axios'

let stdid = "", pwd = "";
let errcnt = 0;

if (typeof window !== "undefined") {
  window.onload = () => {
  }

  window.onclick = (e) => {
    if(!e.target.matches('#userInfoBtn')) {
      let dropdowns = document.querySelector('#userInfoDiv');
  
      if (dropdowns.classList.contains(headerstyles.show)) {
        let dropbtn = document.querySelector('#userInfoBtn')
        dropdowns.classList.remove(headerstyles.show);
        dropbtn.style.background = 'rgba(190, 190, 190, 0.0)';
      }
    } else {
      console.log("asd")
      let dropdowns = document.querySelector('#userInfoDiv');
      let dropbtn = document.querySelector('#userInfoBtn')
      dropdowns.classList.toggle(headerstyles.show);
      if(dropdowns.classList.contains(headerstyles.show)) {
        dropbtn.style.background = 'rgba(190, 190, 190, 0.6)';
      } else {
        dropbtn.style.background = 'rgba(190, 190, 190, 0.0)';
      }
    }
  }
}

const changeHeight = (obj) => {
  if(obj.view === "Subject") {
    let view = document.querySelector("#subjectBoard");
    view.style.height = obj.height + "px";
  } else if(obj.view === "Notice") {
    let view = document.querySelector("#noticeBoard");
    view.style.height = obj.height + "px";
  } else if(obj.view === "Lecture") {
    let view = document.querySelector("#lectureBoard");
    view.style.height = obj.height + "px";
  } else if(obj.view === "Calendar") {
    let view = document.querySelector("#calendarBoard");
    view.style.height = obj.height + "px";
  }
}
export default function Home() {

  const [userData, setUserData] = useState({
    stdid: "",
    pwd: "",
    name: "",
    major: "",
    status: ""
  })
  const [scheduleWindowInfo, setScheduleWindowInfo] = useState({
    year: "",
    month: "",
    subject: []
  })
  const [scheduleWindowShowInfo, setScheduleWindowShowInfo] = useState({
    year: "",
    month: "",
    day: "",
    lectureList: [],
    scheduleList: [],
  })
  const [openingScheduleWindow, setOpeningScheduleWindow] = useState(0);
  
  const addSchedule = async (body) => {
    await axios.get(
      process.env.FRONT_BASE_URL+"/backapi/incomplete?studentId="+stdid
    ).then((response) => {
      console.log(response)
      setScheduleWindowInfo({
        year: body.year,
        month: body.month,
        subject: response.data.Results,
      })
    }).catch((error) => {
      console.log(error.response)
    });
  }

  const showSchedule = (data) => {
    setScheduleWindowShowInfo({
      year: data.body.year,
      month: data.body.month,
      day: data.body.day,
      lectureList: data.body.lectureList,
      scheduleList: data.body.scheduleList,
    })
  }

  useEffect(() => {
    if (typeof window !== "undefined")
      window.addEventListener("message", (e) => {
        if (e.data) {
          if(e.data.head === "changeHeight") {
            changeHeight(e.data.body);
          } else if(e.data.head === "addSchedule") {
            if(openingScheduleWindow == 0) {
              setOpeningScheduleWindow(1);
              addSchedule(e.data.body);
            }
          } else if(e.data.head === "showSchedule") {
            if(openingScheduleWindow == 0) {
              setOpeningScheduleWindow(1);
              showSchedule(e.data);
            }
          }
        }
      }, false);
  });

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
    setUserData({
      ...userData,
      stdid: stdid,
      pwd: pwd,
    })
    
    if(!stdid || !pwd) {
      window.location.href=process.env.FRONT_BASE_URL+'/login';
    } else {
      getUserData(stdid, pwd)
    }
  }, [])

  const getUserData = async (stdid, pwd) => {
    console.log(stdid, pwd)
    await axios.get(
      process.env.FRONT_BASE_URL+"/backapi/student/student-info?studentId="+stdid
    ).then((response) => {
      console.log(response)
      setUserData({
        stdid: stdid,
        pwd: pwd,
        major: response.data.majorName,
        name: response.data.name,
        status: "ok",
      })
    }).catch((error) => {
      console.log(error.response)
      setUserData({
        ...userData,
        status: "error",
      })
      return
    });
  }

  const getUserDataComponent = useCallback(() => {
    if(userData.status != "ok") {
      return ("");
    } else {
      return (
        <div>
          <p>{userData.major}</p>
          <p>{userData.stdid}</p>
          <p>{userData.name}</p>
        </div>
      )
    }
  }, [userData])

  const getMainBoard = useCallback(() => {
    if(userData.status != "ok") {
      if(userData.status == "error") {
        window.location.href=process.env.FRONT_BASE_URL+'/login';
      }
      return (
        <div className={styles.loading_main}>
          <div className={styles.loading_container}>
            <div className={styles.loading}></div>
            <div className={styles.loading_text}>loading</div>
          </div>
        </div>
      );
    } else {
      return (
        <div className={styles.main_board}>
          <div className={styles.board_left}>
            <iframe src={"/calendar?stdid="+stdid+"&pwd="+pwd} id="calendarBoard" className={styles.board_iframe} frameBorder="0" scrolling="no" />
            <iframe src={"/subject?stdid="+stdid+"&pwd="+pwd} id="subjectBoard" className={styles.board_iframe} frameBorder="0" scrolling="no" />
            <iframe src={"/notice?stdid="+stdid+"&pwd="+pwd} id="noticeBoard" className={styles.board_iframe} frameBorder="0" scrolling="no" />
          </div>
          <div className={styles.board_right}>
            <iframe src={"/lecture?stdid="+stdid+"&pwd="+pwd} id="lectureBoard" className={styles.board_iframe} frameBorder="0" scrolling="no" />
          </div>
        </div>
      )
    }
    
  }, [userData])

  const [selectedDateAddSchedule, setSelectedDateAddSchedule] = useState(1)

  const changeSelectedDateAddSchedule = (e) => {
    setSelectedDateAddSchedule(Number(e.target.value));
  };

  const ScheduleDateSelect = useCallback(() => {
    let month_day=[31,28,31,30,31,30,31,31,30,31,30,31]
    
    if (scheduleWindowInfo.year%400 == 0) {
      month_day[1] = 29
    } else if (scheduleWindowInfo.year%100 == 0) {
      month_day[1] = 28
    } else if (scheduleWindowInfo.year%4 == 0) {
      month_day[1] = 29
    } else {
      month_day[1] = 28
    }
    
    let DateOption = [];
    for(let i = 1; i <= month_day[scheduleWindowInfo.month-1]; i++) {
      DateOption.push(
        <option key={i} value={i}>{i}</option>
      );
    }

    return (
      <select onChange={changeSelectedDateAddSchedule} name="date" id="addScheduleDate" value={selectedDateAddSchedule}>
        {DateOption}
      </select>
    )
  }, [selectedDateAddSchedule, scheduleWindowInfo])

  const [selectedSubjectAddSchedule, setSelectedSubjectAddSchedule] = useState(1)

  const changeSelectedSubjectAddSchedule = (e) => {
    setSelectedSubjectAddSchedule(Number(e.target.value));
  };

  const ScheduleSubjectSelect= useCallback(() => {

    const scheduleOption = scheduleWindowInfo.subject.map((subject, idx) => {
      return (
        <option key={idx} value={idx}>{subject.subjectName}</option>
      )
    })

    return (
      <select onChange={changeSelectedSubjectAddSchedule} name="date" id="addScheduleDate" value={selectedSubjectAddSchedule}>
        {scheduleOption}
      </select>
    )
  }, [selectedSubjectAddSchedule, scheduleWindowInfo])

  const submitAddSchedule = async () => {

    const date = scheduleWindowInfo.year+"-"+('00' + scheduleWindowInfo.month).slice(-2)+"-"+('00' + selectedDateAddSchedule).slice(-2)
    const subjectId = scheduleWindowInfo.subject[selectedSubjectAddSchedule].subjectName.slice(-11, scheduleWindowInfo.subject[selectedSubjectAddSchedule].subjectName.length-1)

    await axios.post(process.env.FRONT_BASE_URL+"/backapi/calendar/exam", {
      date: date,
      studentId: stdid,
      subjectId: subjectId
    }, {
      withCredentials: true
    }).then((response) => {
      console.log(response)
      setScheduleWindowInfo({
        year: "",
        month: "",
        subject: []
      })
      setOpeningScheduleWindow(0)
    }).catch((error) => {
      console.log(error.response)
      alert("ERROR!")
    });
  }

  const openScheduleWindow = useCallback(() => {
    if(!scheduleWindowInfo.year || !scheduleWindowInfo.month || scheduleWindowInfo.subject.length == 0) {
      return "";
    } else {
      return (
        <div className={styles.addScheduleWindow_background}>
          <div className={styles.addScheduleWindow}>
            <div className={styles.addScheduleWindow_title}>
              <div>
                <h1>X</h1>
                <h2>시험 일정 추가</h2>
                <h1 onClick={() => {
                  setScheduleWindowInfo({
                    year: "",
                    month: "",
                    subject: []
                  })
                  setOpeningScheduleWindow(0)
                }}>X</h1>
              </div>
              <hr/>
            </div>
            <div className={styles.addScheduleWindow_head}>
              <div className={styles.addScheduleWindow_grow}>
                <div>
                  <h4>{scheduleWindowInfo.year+"."+scheduleWindowInfo.month+"."}</h4>
                  {ScheduleDateSelect()}
                </div>
              </div>
              <div className={styles.addScheduleWindow_grow}>
                <div>
                  <h4>과목명: </h4>
                  {ScheduleSubjectSelect()}
                </div>
              </div>
            </div>
            <div className={styles.addScheduleWindow_body}>
              <h3 onClick={submitAddSchedule}>추가</h3>
            </div>
          </div>
        </div>
      )
    }
  }, [scheduleWindowInfo, selectedDateAddSchedule, selectedSubjectAddSchedule])

  const deleteScheduleItem = async (date, studentId, subjectId) => {
    const question = confirm("일정을 삭제하시겠습니까?")
    if(!question) return
    await axios.post(process.env.FRONT_BASE_URL+"/backapi/calendar/exam/cancel", {
      date: date,
      studentId: studentId,
      subjectId: subjectId
    }, {
      withCredentials: true
    }).then((response) => {
      console.log(response)
      for(let i = 0; i < scheduleWindowShowInfo.scheduleList.length; i++) {
        if(scheduleWindowShowInfo.scheduleList[i].title.slice(-11, scheduleWindowShowInfo.scheduleList[i].title.length-1) == subjectId) {
          scheduleWindowShowInfo.scheduleList.splice(i, 1)
          break;
        }
      }
      setOpeningScheduleWindow(0)
    }).catch((error) => {
      console.log(error.response)
      alert("ERROR!")
    });
  }

  const openScheduleShowWindow = useCallback(() => {
    console.log(scheduleWindowShowInfo)
    if(!scheduleWindowShowInfo.year || !scheduleWindowShowInfo.month || !scheduleWindowShowInfo.day ||
      (scheduleWindowShowInfo.lectureList.length == 0 && scheduleWindowShowInfo.scheduleList.length == 0)) {
      return "";
    } else {

      const getLectureListComponent = () => {
        const lectureItemComponent = scheduleWindowShowInfo.lectureList.map((lecture, idx) => {
          return (
            <h5 key={idx}>{"💻 "+lecture.title}</h5>
          )
        })

        return (
          <div className={styles.showScheduleWindow_lectureList}>
            {lectureItemComponent}
          </div>
        )
      }

      const getScheduleListComponent = () => {
        const scheduleItemComponent = scheduleWindowShowInfo.scheduleList.map((schedule, idx) => {
          return (
            <div key={idx}>
              <h5>{"✨ "+schedule.title}</h5>
              <img src="images/trash.png" onClick={() => {
                const date = scheduleWindowShowInfo.year+"-"+('00' + scheduleWindowShowInfo.month).slice(-2)+"-"+('00' + scheduleWindowShowInfo.day).slice(-2)
                const subjectId = schedule.title.slice(-11, schedule.title.length-1)
                deleteScheduleItem(date, stdid, subjectId)
              }}/>
            </div>
          )
        })

        return (
          <div className={styles.showScheduleWindow_scheduleList}>
            {scheduleItemComponent}
          </div>
        )
      }

      return (
        <div className={styles.showScheduleWindow_background}>
          <div className={styles.showScheduleWindow}>
            <div className={styles.showScheduleWindow_title}>
              <div>
                <h1>X</h1>
                <h2>{scheduleWindowShowInfo.year+"."+('00' + scheduleWindowShowInfo.month).slice(-2)+"."+('00' + scheduleWindowShowInfo.day).slice(-2)}</h2>
                <h1 onClick={() => {
                  setScheduleWindowShowInfo({
                    year: "",
                    month: "",
                    day: "",
                    lectureList: [],
                    scheduleList: [],
                  })
                  setOpeningScheduleWindow(0)
                }}>X</h1>
              </div>
            </div>
            <div className={styles.showScheduleWindow_body}>
              <hr/>
              {getLectureListComponent()}
              <hr/>
              {getScheduleListComponent()}
              <hr/>
            </div>
          </div>
        </div>
      )
    }
  }, [scheduleWindowShowInfo])

  return (
    <div className={styles.container}>
      <Head>
        <title>LMSSU</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header id="header">
        {openScheduleWindow()}
        {openScheduleShowWindow()}
        <nav role="navigation">
          <div className={headerstyles.container}>

            <Link className={headerstyles.logo} href="/">
              <img src="https://class.ssu.ac.kr/customs/main/header_logo.png?v=123213"/>
            </Link>

            <div className={headerstyles.div_grow}></div>

            <div className={headerstyles.dropdown}>
              <div id="userInfoBtn" className={headerstyles.dropbtn}>
                <img src="/images/user.png" alt=""/>
                {getUserDataComponent()}
              </div>
              <div id="userInfoDiv" className={headerstyles.dropdown_content}>
                <div className={headerstyles.dropdown_content_list}>
                  <p className={headerstyles.dropdown_content_item}>
                    내 정보
                  </p>
                </div>
                <div className={headerstyles.dropdown_content_logout}>
                  <p className={headerstyles.logout_btn} onClick={() => {
                    window.location.href=process.env.FRONT_BASE_URL+'/login';
                  }}>
                    로그아웃
                  </p>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className={styles.main}>
        {getMainBoard()}
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}
