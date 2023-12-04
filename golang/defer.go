package main
import "fmt"

func deferUtil() func(int) int {
	i :=0
	return func(n int) int {
		// t :=0
		fmt.Printf("本次调用接收到n=%v\n", 3 / n)
		i++
		fmt.Printf("匿名工具函数第%v次被调用\n", i)
		return i
	}
}
func Defer() int {
	f := deferUtil()
	//f(1)
	defer f(1)
	//defer f(f(3))
	// return f(2)}
	fmt.Printf("本次调用接收到n=%v\n", 132435)
	return 2546
}
func main() {
	ccc := Defer()
	fmt.Printf("main", ccc)
}
