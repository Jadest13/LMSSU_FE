import Head from 'next/head'
import Image from 'next/image'
import noticestyles from '../styles/Notice.module.css'
import loadingstyles from '../styles/Loading.module.css'
import React, { useEffect, useRef, useLayoutEffect, useState, useCallback } from "react";
import axios from 'axios'

if (typeof window !== "undefined") {
  window.onload = () => {
  }

  window.onclick = (e) => {
  }
}

let stdid, pwd;
let errcnt = 0;
let noticeList = [];

export default function Notice() {

  const slideRef = React.createRef();

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

  }, [])

  useEffect(() => {
    const slideHeight = slideRef && slideRef.current && slideRef.current.offsetHeight;
    window.parent.postMessage({ head: "changeHeight", body: {view: "Notice", height: slideHeight } }, '*');
  })

  const [selectedPage, setSelectedPage] = useState(1);
  const [selectedNotice, setSelectedNotice] = useState(0);
  const [selectedNoticeList, setSelectedNoticeList] = useState([[], [], []]);

  const getNoticeListAPI = () => {
    const getApi = async () => {
      let data
      let tmpList = selectedNoticeList.slice();
      let url = process.env.FRONT_BASE_URL+"/backapi/notice/"
      if(selectedNotice == 0) url += "ssu?"
      else if(selectedNotice == 1) url += "major?studentId="+stdid+"&"
      else if(selectedNotice == 2) url += "fun?"
      url += "page="+selectedPage

      await axios.get(
        url
      ).then((response) => {
        data = response.data
        tmpList[selectedNotice][selectedPage-1] = data.ssuNoticeDTO
        selectedNoticeList[selectedNotice][selectedPage-1] = tmpList[selectedNotice][selectedPage-1]
        console.log(tmpList)
      }).catch((error) => {
        console.log(error.response)
        errcnt++
        if(errcnt >= 3) {
          if (typeof window !== "undefined")
            window.location.href=process.env.FRONT_BASE_URL+'/errorPage?error='+error.response.status;
        }
      })
      setSelectedNoticeList(tmpList)
      console.log(selectedNoticeList)
    }

    getApi()
  }

  const changeNoticeType = (type) => {
    setSelectedNotice(type)
    setSelectedPage(1)
  }

  const getNoticeType = useCallback(() => {

    const arr = [
      {title: "학교", id: "notice_ssu"},
      {title: "학과", id: "notice_major"},
      {title: "펀시스템", id: "notice_fun"}
    ]

    const noticeTypes = arr.map((type, idx) => {
      if(idx == selectedNotice) return (
        <div key={idx} id={type.id} className={`${noticestyles.notice_type} ${noticestyles.notice_select}`} onClick={()=>changeNoticeType(idx)}>
          <h4>{type.title}</h4>
          <div className={noticestyles.notice_bot_bar}></div>
        </div>
      )
      else return (
        <div key={idx} id={type.id} className={noticestyles.notice_type} onClick={()=>changeNoticeType(idx)}>
          <h4>{type.title}</h4>
          <div className={noticestyles.notice_bot_bar}></div>
        </div>
      )
    });

    return (
      <div className={noticestyles.notice_type_title}>
        {noticeTypes}
      </div>
    )
  }, [selectedNotice])

  const changeNoticePage = (num) => {
    if(num >= 5) {
      if(selectedNotice == 0) {
        window.open('https://scatch.ssu.ac.kr/%ea%b3%b5%ec%a7%80%ec%82%ac%ed%95%ad/', '_blank')
      } else if(selectedNotice == 1) {
        window.open('http://cse.ssu.ac.kr/03_sub/01_sub.htm', '_blank')
      } else if(selectedNotice == 2) {
        window.open('https://fun.ssu.ac.kr/', '_blank')
      }
    } else {
      setSelectedPage(num)
    }
  };

  const changeNoticePagePrev = () => {
    if(selectedPage > 1)
      setSelectedPage(selectedPage - 1)
  };

  const changeNoticePageNext = () => {
    if(selectedPage < 4)
      setSelectedPage(selectedPage + 1)
  };
  
  const getNoticePage = useCallback(() => {
    const arr = [];
    for(let i = 1; i <= 5; i++) {
      arr[i] = i;
    }

    const pageList = arr.map((page, idx) => {
      if(page == selectedPage) return (
        <h4 key={idx} id={"page"+page} className={noticestyles.notice_page_select} onClick={()=>changeNoticePage(page)}>
          {page!=5?page:(page+"...")}
        </h4>
      )
      else return (
        <h4 key={idx} id={"page"+page} onClick={()=>{changeNoticePage(page)}}>
          {page!=5?page:("...")}
        </h4>
      )
    });

    return (
      <div id="pageItems" className={noticestyles.notice_page_number}>
        {pageList}
      </div>
    )
  }, [selectedPage]);

  const getNoticeList = useCallback(() => {
    let noticeListComponent;
    if(selectedNotice >= selectedNoticeList.length || selectedPage > selectedNoticeList[selectedNotice].length) {
      noticeListComponent = (
        <div className={loadingstyles.main}>
          <div className={loadingstyles.square}>
            <div className={loadingstyles.spin}></div>
          </div>
        </div>
      )
    } else {
      noticeListComponent = selectedNoticeList[selectedNotice][selectedPage-1].map((name, idx) => 
        <div key={"notice"+idx}>
          <div className={noticestyles.notice_content}>
            <p className={noticestyles.notice_content_dot}>·</p>
            <p className={noticestyles.notice_content_title} onClick={() => {
              window.open(name.url, '_blank')
            }}>
              {name.title}
            </p>
            <div></div>
            <p className={noticestyles.notice_content_date}>{name.date}</p>
          </div>
          <hr />
        </div>
      );
    }

    return <div className={noticestyles.notice_contents}>{noticeListComponent}</div>;
  }, [selectedNotice, selectedPage, selectedNoticeList])

  const getMainComponent = useCallback(() => {
    
    if(!selectedNoticeList[selectedNotice][selectedPage-1]) {
      getNoticeListAPI()
    }

    return (
      <div className={noticestyles.notice_board}>
        {getNoticeType()}
        <div className={noticestyles.notice_contents}>
          {getNoticeList()}
        </div>
        <div className={noticestyles.notice_page}>
          <div className={noticestyles.div_grow}></div>
          <h4 onClick={changeNoticePagePrev}>{"<"}</h4>
          {getNoticePage()}
          <h4 onClick={changeNoticePageNext}>{">"}</h4>
          <div className={noticestyles.div_grow}></div>
        </div>
      </div>
    )
  }, [selectedNotice, selectedPage])

  return (
    <div ref={slideRef}>
      <Head>
        <title>LMSSU</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {getMainComponent()}
      </main>
    </div>
  )
}
