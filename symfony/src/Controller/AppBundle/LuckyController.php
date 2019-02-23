<?php
// src/AppBundle/Controller/LuckyController.php
namespace App\Controller\AppBundle;
 
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class LuckyController extends Controller
{

    public function numberAction($count)
    {
        $numbers = array();
        for ($i = 0; $i < $count; $i++) {
            $numbers[] = rand(0, 100);
        }
        // implode() 函数返回由数组元素组合成的字符串。
        $numbersList = implode(', ', $numbers);
 
      // => 是数组成员访问符号
      // -> 是对象成员访问符号
       $html = $this->container->get('templating')->render(
           'lucky/number.html.twig',
           array('luckyNumberList' => $numbersList)
       );

       return new Response($html);
      // render: a shortcut that does the same as above 快捷方法
      // return $this->render(
      //   'lucky/number.html.twig',
      //   array('luckyNumberList' => $numbersList)
      // );
    }
}