import Head from 'next/head'
import Image from 'next/image'
import lecturestyles from '../styles/Lecture.module.css'
import loadingstyles from '../styles/Loading.module.css'
import MARQUEE from "react-fast-marquee";
import React, { useEffect, useRef, useLayoutEffect, useState, useCallback } from "react";
import axios from 'axios'

let stdid = "", pwd = "";
let errcnt = 0;

const slideRef = React.createRef();

export default function Lecture() {

  let semesterBegin = new Date("2022-09-01")
  let nowWeeks = parseInt((new Date().getTime() - semesterBegin.getTime())/(1000*60*60*24*7)+1)

  const [selectedWeeks, setSelectedWeeks] = useState(nowWeeks);
  const [weeklySubjectList, setWeeklySubjectList] = useState([]);
  const [userData, setUserData] = useState({
    stdid: "",
    pwd: "",
  })
  let listLoading = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

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
      stdid: stdid,
      pwd: pwd,
    })
  }, [])
  
  useEffect(() => {
    const slideHeight = slideRef && slideRef.current && slideRef.current.offsetHeight;
    window.parent.postMessage({ head: "changeHeight", body: {view: "Lecture", height: slideHeight } }, '*');
  })
  
  const getLectureSubjects = (item) => {
    let subjectList = weeklySubjectList[selectedWeeks].weeksSubjectListDTO.subjectDTO[item].subjectContentsTitle.map((subject, idx) => {
      let img_src = "images/"
      if(subject.contentsType == "assignment") img_src += "assignment.png"
      else if(subject.contentsType == "mp4") img_src += "play-button.png"
      else if(subject.contentsType == "pdf") img_src += "pdf.png"
      else if(subject.contentsType == "file") img_src += "file.png"
      else if(subject.contentsType == "offline_attendance") img_src += "lecture.png"
      else if(subject.contentsType == "text") img_src += "text.png"
      else if(subject.contentsType == "zoom") img_src += "zoom.png"
      else if(subject.contentsType == "video_conference") img_src += "video.png"

      return (
        <div key={"lectureSubject"+idx} className={lecturestyles.lecture_subject}>
          <img src={img_src}/>
          <h5>{subject.title}</h5>
        </div>
      )
    });
    if(subjectList.length == 0) {
      subjectList = (
        <div className={lecturestyles.lecture_subject_empty}>
          <h3>-</h3>
        </div>
      )
    }
  
    return <div className={lecturestyles.lecture_subjects}>{subjectList}</div>;
  }
  
  const checkTodoList = async (e) => {
    let REQ_URL = process.env.FRONT_BASE_URL + "/backapi/list/todo/check"
    if(!e.target.checked) REQ_URL += "/cancel"
    REQ_URL += "?toDoId="+e.target.value
    await axios.get(
      REQ_URL
    ).then((response) => {
      listLoading[selectedWeeks] = 0;
      getLectureItems()
    }).catch((error) => {
      console.log(error)
    });
  }
  
  const deleteTodoList = async (todoId) => {
    const REQ_URL = process.env.FRONT_BASE_URL+"/backapi/list/todo/cancel?toDoId="+todoId
    await axios.get(
      REQ_URL
    ).then((response) => {
      alert("TO-DO LIST를 삭제했습니다")
      listLoading[selectedWeeks] = 0;
      getLectureItems()
    }).catch((error) => {
      console.log(error)
    });
  }

  const addTodoList = async (subjectId) => {
    let content = prompt("TO-DO LIST를 입력해주세요");
    if(!content) return

    if(listLoading[selectedWeeks]) return;
    listLoading[selectedWeeks] = 1;
    const REQ_URL = process.env.FRONT_BASE_URL+"/backapi/list/todo"
    await axios.post(REQ_URL, {
      studentId: stdid,
      subjectId: subjectId,
      week: selectedWeeks,
      content: content
    }, {
      timeout: 90000,
      withCredentials: true
    }).then((response) => {
      alert("TO-DO LIST 추가에 성공했습니다!")
      listLoading[selectedWeeks] = 0;
      getLectureItems()
    }).catch((error) => {
      console.log(error)
    });
  }

  const getLectureTodoLists = (item) => {
    let todoList = weeklySubjectList[selectedWeeks].weeksSubjectListDTO.subjectDTO[item].toDoDTO.map((todoItem, idx) => 
      <div key={"lectureTodoList"+idx} className={lecturestyles.lecture_todolist_content}>
        <hr/>
        <div className={lecturestyles.lecture_todolist_item}>
          <input className={lecturestyles.lecture_todolist_check} type="checkbox" name="check" id="GFG" value={todoItem.toDoId} onChange={(e)=>checkTodoList(e)} defaultChecked={todoItem.isDone?"defaultChecked":""} />
          <div className={lecturestyles.lecture_todolist_title}>
            <h5>{todoItem.content}</h5>
          </div>
          <img src="images/trash.png" onClick={() => {
            deleteTodoList(todoItem.toDoId)
          }}/>
        </div>
      </div>
    );
    if(todoList.length == 0) {
      todoList = (
        <div className={lecturestyles.lecture_todolist_title_empty}>
          <h3>-</h3>
        </div>
      )
    }
  
    return (
      <div className={lecturestyles.lecture_todolist}>
        <div className={lecturestyles.lecture_todolist_titlebar}>
          <h4>TO-DO-LIST</h4>
          <div onClick={() => {
            const title = weeklySubjectList[selectedWeeks].weeksSubjectListDTO.subjectDTO[item].title
            addTodoList(title.slice(-11, title.length-1))
          }}>
            <h4>추가</h4>
          </div>
        </div>
        {todoList}
      </div>
    )
  }
  
  const getLectureNotice = (i) => {
    const lectureNoticeList = weeklySubjectList[selectedWeeks].subjectNoticeListDTO[i].subjectNoticeDTO.map((notice, idx) =>  {
      return (
        <h6 key={idx} onClick={() => {
          window.open(notice.noticeLink, '_blank')
        }}>
          {notice.title}
        </h6>
      )
    })

    return (
      <marquee>
        <div>
          {lectureNoticeList}
        </div>
      </marquee>
    )
  }

  const getLectureItems = () => {
    const getApi = async () => {
      const REQ_URL = process.env.FRONT_BASE_URL+"/backapi/list?week="+selectedWeeks
      let data
      let tmpList = weeklySubjectList.slice()
      console.log(stdid, pwd)
      axios.defaults.withCredentials = true;
      if(listLoading[selectedWeeks-1] == 1) return;
      listLoading[selectedWeeks-1] = 1;
      console.log("LETSGO")
      
      await axios.post(REQ_URL, {
        studentId: stdid,
        userId: stdid,
        pwd: pwd
      }, {
        timeout: 90000,
        withCredentials: true
      }).then((response) => {
        data = response.data
        tmpList[selectedWeeks] = data
        weeklySubjectList[selectedWeeks] = tmpList[selectedWeeks]
        listLoading[selectedWeeks-1] = 2;
      }).catch((error) => {
        console.log(error.response)
        
        errcnt++
        if(errcnt >= 3) {
          window.location.href=process.env.FRONT_BASE_URL+'/errorPage?error='+error.response.status;
        }
      });

      setWeeklySubjectList(tmpList)
      
      console.log(weeklySubjectList)
    }
    getApi();
  }
  
  const getLectureItemsComponent = useCallback(() => {
    let lectureList;

    if(weeklySubjectList[selectedWeeks] !== undefined) {
      lectureList = weeklySubjectList[selectedWeeks].subjectNoticeListDTO.map((lecture, idx) =>  {
        return (
          <div key={"lecture"+idx} className={lecturestyles.lecture_item}>
            <div className={lecturestyles.lecture_top_bar}>
              <h3>{lecture.title}</h3>
              <div className={lecturestyles.div_grow}></div>
              <img src="images/home-icon-silhouette.png" onClick={() => {
                window.open(lecture.homepageAddress, '_blank')
              }}/>
            </div>
            <div className={lecturestyles.lecture_notice}>
              <img src="images/megaphone.png"/>
              {getLectureNotice(idx)}
            </div>
            <div className={lecturestyles.lecture_content}>
              {getLectureSubjects(idx)}
              {getLectureTodoLists(idx)}
            </div>
          </div>
        )
      });

      return (
        <div className={lecturestyles.lecture_items}>{lectureList}</div>
      )
    } else {
      return (
        <div className={loadingstyles.main}>
          <div className={loadingstyles.clock}></div>
        </div>
      )
    }
  }, [selectedWeeks, weeklySubjectList])

  const changeWeekPrev = () => {
    if(selectedWeeks > 1) {
      setSelectedWeeks(selectedWeeks - 1);
    }
  };

  const changeWeekNext = () => {
    if(selectedWeeks < 16) {
      setSelectedWeeks(selectedWeeks + 1);
    }
  };
  
  const getLectureWeeks = useCallback(() => {
    let startWeek = new Date(semesterBegin)
    startWeek.setDate(startWeek.getDate()+(selectedWeeks-1)*7)
    let endWeek = new Date(startWeek)
    endWeek.setDate(endWeek.getDate() + 7)

    if(!userData.stdid || !userData.pwd) return ("");

    if(weeklySubjectList[selectedWeeks] === undefined) {
      getLectureItems();
    }

    return (
      <div className={lecturestyles.lecture_board}>
        <div className={lecturestyles.lecture_week}>
          <h1 onClick={changeWeekPrev}>{"<"}</h1>
          <div>
            <h1>{selectedWeeks+"주차"}</h1>
            <h5>{(startWeek.getMonth()+1)+"/"+startWeek.getDate()+" ~ "+(endWeek.getMonth()+1)+"/"+endWeek.getDate()}</h5>
          </div>
          <h1 onClick={changeWeekNext}>{">"}</h1>
        </div>
        {getLectureItemsComponent()}
      </div>
    )
  }, [selectedWeeks, userData])

  return (
    <div ref={slideRef}>
      <Head>
        <title>LMSSU</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {getLectureWeeks()}
      </main>
    </div>
  )
}
