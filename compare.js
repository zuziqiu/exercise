.footer_v2 {
    background: #2e3d4b;
    height: 230px;
    padding-top: 70px;
    .footer_cont {
        width: 900px;
        min-width: 600px;
        font-size: 1.6rem;
        color: #ffffff;
        margin: 0 auto;
        //height: 6rem;
        .left {
            float: left;
            width: 140px;
            img {
                float: left;
                width: 100px;
                height: 100px;
                display:block;
                margin-right: 0px;
            }
            p {
                
                line-height: 160px;
            }
        }
        .right {
            width: 390px;
            float: left;
            text-align: left;
            margin-top: 2px;
            margin-right: 40px;
            padding: 0 40px;
            border-left: 1px solid #25323e;
            border-right: 1px solid #25323e;
            ul {
                float: left;
                margin-bottom: 26px;
                height: 16px;
                display: block;
                li {
                    &:first-child{
                        padding-left: 0;
                    }
                    line-height: 16px;
                    font-size: 16px;
                    float: left;
                    padding: 0 14px;
                    border-right: 1px solid #ffffff;
                    // &.last {
                    //     border-right: none;
                    //     padding: 0 0 0 8px;
                    // }
                    a {
                        color: #ffffff;
                    }
                }
            }
            
            p {
                margin-bottom: 22px;
                &:last-child{
                    margin: 0;
                }
            }
        }
        .cooperative_partner{
            overflow: hidden;
            p{
                font-size: 16px;
                color: #ffffff;
            }
            ul{
                li{
                    font-size: 16px;
                    color: #99ffffff;
                    margin-top: 20px;
                }
            }
        }
    }
}