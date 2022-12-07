import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import React, { useCallback, useEffect, useState } from "react";

let errorNo;

export default function Home() {

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    for(const param of searchParams) {
      if(param[0] == 'error') {
        errorNo = param[1]
      }
    }
    
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>ERROR</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1>{errorNo}</h1>
      </main>
    </div>
  )
}
