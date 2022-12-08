import Head from 'next/head'
import Image from 'next/image'
import subjectstyles from '../styles/Subject.module.css'
import loadingstyles from '../styles/Loading.module.css'
import React, { useEffect, useRef, useLayoutEffect, useState, useCallback } from "react";
import axios from 'axios'

let stdid, pwd;
let errcnt = 0;

const slideRef = React.createRef();

export default function Subject() {

  const [subjectList, setSubjectList] = useState([]);
  const [subjectShow, setSubjectShow] = useState([]);

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

    const getApi = async () => {
      let url = process.env.FRONT_BASE_URL+"/backapi/incomplete?studentId="+stdid
      await axios.get(
        url
      ).then((response) => {
        const data = response.data
        console.log(data.Results)
        setSubjectList(data.Results)
        setSubjectShow([0, 0, 0, 0, 0])
      }).catch((error) => {
        console.log(error.response)
        errcnt++
        if(errcnt >= 3) {
          window.location.href=process.env.FRONT_BASE_URL+'/errorPage?error='+error.response.status;
        }
      })
    }
    getApi();
  }, [])

  useEffect(() => {
    const slideHeight = slideRef && slideRef.current && slideRef.current.offsetHeight;
    console.log(slideHeight)
    window.parent.postMessage({ head: "changeHeight", body: {view: "Subject", height: slideHeight } }, '*');
  })

  const getSubjectList = useCallback(() => {
    let names = []
    for(let i = 0; i < subjectShow.length; i++) {
      names.push(subjectList[i]);
    }

    let subjectListComponent = []
    if(subjectShow.length == 0) {
      subjectListComponent.push(
        <div key={0} className={loadingstyles.main}>
          <div className={loadingstyles.square}>
            <div className={loadingstyles.spin}></div>
          </div>
        </div>
      );
    } else {
      subjectListComponent = names.map((subject, idx1) => {
        const subjectListItemComponent = subject.subjectContents_endDateDTOList.map((item, idx2) => {
          let img_src = "images/"
          if(item.contentsType == "assignment") img_src += "assignment.png"
          else if(item.contentsType == "mp4") img_src += "play-button.png"
          else if(item.contentsType == "pdf") img_src += "pdf.png"
          else if(item.contentsType == "text") img_src += "text.png"
          else if(item.contentsType == "file") img_src += "file.png"
          else if(item.contentsType == "offline_attendance") img_src += "lecture.png"
          else if(item.contentsType == "zoom") img_src += "zoom.png"
          else if(item.contentsType == "video_conference") img_src += "video.png"
          else if(item.contentsType == "readystream") img_src += "play-button.png"

          let dday = parseInt((new Date(item.endDate).getTime() - new Date().getTime())/(1000*60*60*24))

          return (
            <div key={idx1+" "+idx2} className={subjectstyles.subject_item_item}>
              <img src={img_src}/>
              <h4 onClick={() => {
                window.open(subject.link+"/external_tools/2", '_blank')
              }}>{item.title}</h4>
              <div className={subjectstyles.div_grow}></div>
              <h6>{dday==0?"D-Day":"D-"+dday}</h6>
            </div>
          )
        })

        return (
          <div key={idx1}>
            <div className={subjectstyles.subject_item}>
              <div className={subject.subjectContents_endDateDTOList.length==0?(subjectstyles.subject_item_cnt):(`${subjectstyles.subject_item_cnt} ${subjectstyles.subject_item_exist}`)}>
                {subject.subjectContents_endDateDTOList.length}
              </div>
              <div className={subjectstyles.subject_item_title}>
                <h5>{subject.subjectName}</h5>
                <h6>{subject.professorName}</h6>
              </div>
              <h3 className={subjectstyles.subject_fold} onClick={() => {
                let arr = subjectShow.slice();
                arr[idx1] = (arr[idx1]+1)%2;
                setSubjectShow(arr)
              }}>{subjectList[idx1].subjectContents_endDateDTOList.length==0?"":subjectShow[idx1]==1?"∧":"∨"}</h3>
            </div>
            {subjectShow[idx1]?subjectListItemComponent:""}
            <hr/>
          </div>
        )
      });
    }
    if(subjectShow.length < subjectList.length) {
      subjectListComponent.push(
        <h3 key="+" onClick={() => {
          let arr = subjectShow.slice();
          for(let i = 5; i < subjectList.length; i++) {
            arr.push(0);
          }
          setSubjectShow(arr);
        }}>더보기 +</h3>
      )
    }
  
    return (
      <div className={subjectstyles.subject_list}>
        {subjectListComponent}
      </div>
    )
  }, [subjectShow])

  return (
    <div ref={slideRef}>
      <Head>
        <title>LMSSU</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className={subjectstyles.subject_board}>
          <h2>마감임박 강의/과제</h2>
          {getSubjectList()}
        </div>
      </main>
    </div>
  )
}
