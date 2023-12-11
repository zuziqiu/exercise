package main

import	"fmt"
import	"io"
import	"net"

func main() {
	// 创建tcp的监听地址
	tcpAddr,_ := net.ResolveTCPAddr("tcp", "127.0.0.1:8080")// tcp监听
	listen, _ := net.ListenTCP("tcp", tcpAddr)
	for {
		// 等待连接
		conn, err := listen.AcceptTCP()
		if err != nil {
			fmt.Println(err)
			break
		}
		// 获取客户端的地址
		fmt.Println(conn.RemoteAddr().String() + "fetch client")
		// 读取客户端传来的数据
		for {
			var buf []byte = make([]byte, 1024)
			n, err := conn.Read(buf)
			// 客户端退出
			if err == io.EOF {
				fmt.Println(conn.RemoteAddr().String() + "out")
				break
			}
			fmt.Println(string(buf[0:n]))
			conn.Write(buf[0:n])
		}
	}
}