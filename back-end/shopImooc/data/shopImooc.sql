CREATE DATABASE IF NOT EXISTS `shopImooc`;
USE `shopImooc`;
-- 管理员表
DROP TABLE IF EXISTS `imooc_admin`;
CREATE TABLE `imooc_admin`(
`id` tinyint unsigned auto_increment key,
`username` varchar(20) not null unique,
`password` char(32) not null,
`email` varchar(50) not null
);

--分类表
DROP TABLE IF EXISTS `imooc_cate`;
CREATE TABLE `imooc_cate` (
`id` smallint(5) unsigned auto_increment key,
`cName` varchar(50) unique
);

--商品表
DROP TABLE IF EXISTS `imooc_pro`;
CREATE TABLE `imooc_pro`(
`id` int unsigned auto_increment key,
`pName` varchar(50) not null unique,
`pSn` varchar(50) not null,
`pNum` int unsigned default 1,
`mPrice` decimal(10,2) not null,
`iPrice` decimal(10,2) not null,
`pDesc` text,
`pImg` varchar(50) not null,
`pubTime` int unsigned not null,
`isShow` tinyint(1) default 1,
`isHot` tinyint(1) default 0,
`cId` smallint unsigned not null
);

--用户表
DROP TABLE IF EXISTS `imooc_user`;
CREATE TABLE `imooc_user`(
 `id` INT UNSIGNED AUTO_INCREMENT KEY ,
 `userName` VARCHAR(20) NOT NULL UNIQUE ,
 `passWord` CHAR(32) NOT NULL ,
 `sex` ENUM('男','女','保密') NOT NULL DEFAULT '保密',
 `face` VARCHAR(50) NOT NULL ,
 `regTime` INT UNSIGNED NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

--相册表
DROP TABLE IF EXISTS `imooc_album`;
CREATE TABLE `imooc_album` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `pid` int(10) unsigned NOT NULL,
  `albumPath` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8;