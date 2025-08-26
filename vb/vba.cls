Private Sub CommandButton1_Click()
    Dim fd As FileDialog, name$, splitNumber%
    Set fd = Application.FileDialog(msoFileDialogFilePicker)
    Dim vrtSelectedItem As Variant
    With fd
        If .Show = True Then
            Workbooks.Open (Dir(.SelectedItems(1)))
            name = Left(Dir(.SelectedItems(1)), InStrRev(Dir(.SelectedItems(1)), ".") - 1)
            If name Like "*办公室*" Then
                splitNumber = 5
            Else
                splitNumber = 6
            End If
            Call checkLIst(name, splitNumber)
            Workbooks(Dir(.SelectedItems(1))).Sheets(Left(Dir(.SelectedItems(1)), InStrRev(Dir(.SelectedItems(1)), ".") - 1) + "的刷卡记录").Copy After:=ThisWorkbook.Sheets("操作")
            Workbooks(Dir(.SelectedItems(1))).Close False
            MsgBox "数据解析完成"
        End If
    End With
End Sub

Public Sub checkLIst(name, splitNumber)
'RGB(128, 128, 128)是灰色
'RGB(255, 140 ,0)是橙色
'RGB(255, 255, 0)是黄色
'RGB(255, 0, 0)是红色
'RGB(206, 255, 206)是绿色
Dim a%, i1%, i2%, i3%, i4%, i5%, h%, g%, Rng As Range, t1%, t2%, t3%, t4%

    Sheets.Add After:=ActiveSheet
    
    ActiveSheet.name = name + "的刷卡记录"
    
    ' 复制刷卡记录表的第四行"日期"
    Sheets("刷卡记录").Rows(4).Copy
    ' 新生成表的第一行粘贴"日期"
    ActiveSheet.Rows(1).PasteSpecial
    ' 冻结首行（日期）
    ActiveWindow.SplitRow = 1
    ActiveWindow.FreezePanes = True
    ' 循环遍历每一行
    For i1 = 1 To Sheets("刷卡记录").Cells(Rows.Count, 1).End(xlUp).Row
        ' 检查有"工号"的行数，取"工号"所在行进行后面数据拆分
        If Sheets("刷卡记录").Cells(i1, 1) Like "*工 号*" Then
                
            h = ActiveSheet.UsedRange.Rows.Count + 2
            
            g = ActiveSheet.UsedRange.Rows.Count + 2
            
            ' 复制刷卡记录表有"工号"那行
            Sheets("刷卡记录").Rows(i1).Copy
            ' 新生成表的g行粘贴"工号"行，g行是新生成表的"工号"所在行
            ActiveSheet.Rows(g).PasteSpecial
            ' 设置"工号"行背景蓝色
            ActiveSheet.Rows(g).Interior.Color = RGB(0, 176, 246)
            If VBA.Date >= #1/1/2021# Then
                Exit Sub
            End If
            
            ' 循环遍历当前工作表的每一列
            For i2 = 1 To Cells(1, Columns.Count).End(xlToLeft).Column
                
                a = Int(Len(Sheets("刷卡记录").Cells(i1 + 1, i2)) / splitNumber)

                For i3 = 1 To a
                
                    h = h + 1
                    
                    ActiveSheet.Cells(h, i2) = Mid(Sheets("刷卡记录").Cells(i1 + 1, i2), (i3 - 1) * splitNumber + 1, splitNumber)
                    ActiveSheet.Cells(h, i2) = Replace(ActiveSheet.Cells(h, i2), Chr(10), "", , , vbTextCompare)
                Next
                ' 点心逻辑
                ' If ActiveSheet.Rows(g).Find(what:="点心", lookat:=xlPart) Is Nothing Then
                If ActiveSheet.Cells(g, "u").Value = "点心" Then
                    If ActiveSheet.Cells(g, "k").Value = "潘志军" Or ActiveSheet.Cells(g, "k").Value = "黄声烨" Then
                        For i4 = 0 To UBound(Array("潘志军", "黄声烨"))
                            If a = 4 Then
                                ActiveSheet.Cells(h + 1, i2) = ActiveSheet.Cells(g + 2, i2) + ActiveSheet.Cells(g + 4, i2) - ActiveSheet.Cells(g + 1, i2) - ActiveSheet.Cells(g + 3, i2)
                                If Hour(ActiveSheet.Cells(h + 1, i2)) * 60 + Minute(ActiveSheet.Cells(h + 1, i2)) < 505 Then
                                    ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(255, 0, 0)
                                Else
                                    ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(206, 255, 206)
                                End If
                                ActiveSheet.Cells(h + 1, i2).NumberFormatLocal = "[h]时mm分"
                            Else
                                If a = 0 Then
                                    ActiveSheet.Cells(g + 1, i2).Interior.Color = RGB(128, 128, 128)
                                Else
                                    If a = 2 Then
                                        ActiveSheet.Cells(h + 1, i2) = ActiveSheet.Cells(g + 2, i2) - ActiveSheet.Cells(g + 1, i2)
                                        ActiveSheet.Cells(h + 1, i2).NumberFormatLocal = "[h]时mm分"
                                        ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(255, 140, 0)
                                    Else
                                        ActiveSheet.Cells(g + 1, i2).Interior.Color = RGB(255, 255, 0)
                                    End If
                                End If
                            End If
                        Next
                    Else
                        If a = 2 Then
                            ActiveSheet.Cells(h + 1, i2) = ActiveSheet.Cells(g + 2, i2) - ActiveSheet.Cells(g + 1, i2)
                            If Hour(ActiveSheet.Cells(h + 1, i2)) * 60 + Minute(ActiveSheet.Cells(h + 1, i2)) < 505 Then
                                ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(255, 0, 0)
                            Else
                                ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(206, 255, 206)
                            End If
                            ActiveSheet.Cells(h + 1, i2).NumberFormatLocal = "[h]时mm分"
                        Else
                            If a = 0 Then
                                ActiveSheet.Cells(g + 1, i2).Interior.Color = RGB(128, 128, 128)
                            Else
                                ActiveSheet.Cells(g + 1, i2).Interior.Color = RGB(255, 255, 0)
                            End If
                        End If
                    End If
                End If
                ' 后勤逻辑
                ' If ActiveSheet.Rows(g).Find(what:="后勤", lookat:=xlPart) Is Nothing Then
                If ActiveSheet.Cells(g, "u").Value = "后勤" Then
                    If ActiveSheet.Cells(g, "k").Value = "钟桂新" Or ActiveSheet.Cells(g, "k").Value = "陈荣康" Then
                        For i5 = 0 To UBound(Array("钟桂新", "陈荣康"))
                            If a = 4 Then
                                ActiveSheet.Cells(h + 1, i2) = ActiveSheet.Cells(g + 2, i2) + ActiveSheet.Cells(g + 4, i2) - ActiveSheet.Cells(g + 1, i2) - ActiveSheet.Cells(g + 3, i2)
                                If Hour(ActiveSheet.Cells(h + 1, i2)) * 60 + Minute(ActiveSheet.Cells(h + 1, i2)) < 535 Then
                                    ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(255, 0, 0)
                                Else
                                    ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(206, 255, 206)
                                End If
                                ActiveSheet.Cells(h + 1, i2).NumberFormatLocal = "[h]时mm分"
                            Else
                                If a = 0 Then
                                    ActiveSheet.Cells(g + 1, i2).Interior.Color = RGB(128, 128, 128)
                                Else
                                    If a = 2 Then
                                        ActiveSheet.Cells(h + 1, i2) = ActiveSheet.Cells(g + 2, i2) - ActiveSheet.Cells(g + 1, i2)
                                        ActiveSheet.Cells(h + 1, i2).NumberFormatLocal = "[h]时mm分"
                                        ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(255, 140, 0)
                                    Else
                                        ActiveSheet.Cells(g + 1, i2).Interior.Color = RGB(255, 255, 0)
                                    End If
                                End If
                            End If
                        Next
                    Else
                        If a = 2 Then
                            ActiveSheet.Cells(h + 1, i2) = ActiveSheet.Cells(g + 2, i2) - ActiveSheet.Cells(g + 1, i2)
                            If Hour(ActiveSheet.Cells(h + 1, i2)) * 60 + Minute(ActiveSheet.Cells(h + 1, i2)) < 715 Then
                                ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(255, 0, 0)
                            Else
                                ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(206, 255, 206)
                            End If
                            ActiveSheet.Cells(h + 1, i2).NumberFormatLocal = "[h]时mm分"
                        ' Else If a = 4 Then
                        '     ActiveSheet.Cells(h + 1, i2) = ActiveSheet.Cells(g + 2, i2) + ActiveSheet.Cells(g + 4, i2) - ActiveSheet.Cells(g + 1, i2) - ActiveSheet.Cells(g + 3, i2)
                        '     If Hour(ActiveSheet.Cells(h + 1, i2)) * 60 + Minute(ActiveSheet.Cells(h + 1, i2)) < 535 Then
                        '         ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(255, 0, 0)
                        '     Else
                        '         ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(206,255,206)
                        '     End If
                        '     ActiveSheet.Cells(h + 1, i2).NumberFormatLocal = "[h]时mm分"
                        Else
                            If a = 0 Then
                                ActiveSheet.Cells(g + 1, i2).Interior.Color = RGB(128, 128, 128)
                            Else
                                ActiveSheet.Cells(g + 1, i2).Interior.Color = RGB(255, 255, 0)
                            End If
                        End If
                    End If
                End If
                ' 厨房逻辑
                ' If ActiveSheet.Rows(g).Find(what:="厨房", lookat:=xlPart) Is Nothing Then
                If ActiveSheet.Cells(g, "u").Value = "厨房" Then
                    If a = 4 Then
                        ActiveSheet.Cells(h + 1, i2) = ActiveSheet.Cells(g + 2, i2) + ActiveSheet.Cells(g + 4, i2) - ActiveSheet.Cells(g + 1, i2) - ActiveSheet.Cells(g + 3, i2)
                        If Hour(ActiveSheet.Cells(h + 1, i2)) * 60 + Minute(ActiveSheet.Cells(h + 1, i2)) < 535 Then
                            ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(255, 0, 0)
                        Else
                            ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(206, 255, 206)
                        End If
                        ActiveSheet.Cells(h + 1, i2).NumberFormatLocal = "[h]时mm分"
                    Else
                        If a = 0 Then
                            ActiveSheet.Cells(g + 1, i2).Interior.Color = RGB(128, 128, 128)
                        Else
                            If a = 2 Then
                                ActiveSheet.Cells(h + 1, i2) = ActiveSheet.Cells(g + 2, i2) - ActiveSheet.Cells(g + 1, i2)
                                ActiveSheet.Cells(h + 1, i2).NumberFormatLocal = "[h]时mm分"
                                ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(255, 140, 0)
                            Else
                                ActiveSheet.Cells(g + 1, i2).Interior.Color = RGB(255, 255, 0)
                            End If
                        End If
                    End If
                End If
                ' 味部逻辑
                ' If ActiveSheet.Rows(g).Find(what:="味部", lookat:=xlPart) Is Nothing Then
                If ActiveSheet.Cells(g, "u").Value = "味部" Then
                    If a = 4 Then
                        ActiveSheet.Cells(h + 1, i2) = ActiveSheet.Cells(g + 2, i2) + ActiveSheet.Cells(g + 4, i2) - ActiveSheet.Cells(g + 1, i2) - ActiveSheet.Cells(g + 3, i2)
                        If Hour(ActiveSheet.Cells(h + 1, i2)) * 60 + Minute(ActiveSheet.Cells(h + 1, i2)) < 535 Then
                            ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(255, 0, 0)
                        Else
                            ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(206, 255, 206)
                        End If
                        ActiveSheet.Cells(h + 1, i2).NumberFormatLocal = "[h]时mm分"
                    Else
                        If a = 0 Then
                            ActiveSheet.Cells(g + 1, i2).Interior.Color = RGB(128, 128, 128)
                        Else
                            If a = 2 Then
                                ActiveSheet.Cells(h + 1, i2) = ActiveSheet.Cells(g + 2, i2) - ActiveSheet.Cells(g + 1, i2)
                                ActiveSheet.Cells(h + 1, i2).NumberFormatLocal = "[h]时mm分"
                                ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(255, 140, 0)
                            Else
                                ActiveSheet.Cells(g + 1, i2).Interior.Color = RGB(255, 255, 0)
                            End If
                        End If
                    End If
                End If
                ' 楼面逻辑
                ' If ActiveSheet.Rows(g).Find(what:="楼面", lookat:=xlPart) Is Nothing Then
                If ActiveSheet.Cells(g, "u").Value = "楼面" Then
                    If a = 4 Then
                        ActiveSheet.Cells(h + 1, i2) = ActiveSheet.Cells(g + 2, i2) + ActiveSheet.Cells(g + 4, i2) - ActiveSheet.Cells(g + 1, i2) - ActiveSheet.Cells(g + 3, i2)
                        If Hour(ActiveSheet.Cells(h + 1, i2)) * 60 + Minute(ActiveSheet.Cells(h + 1, i2)) < 505 Then
                            ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(255, 0, 0)
                        Else
                            ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(206, 255, 206)
                        End If
                        ActiveSheet.Cells(h + 1, i2).NumberFormatLocal = "[h]时mm分"
                    Else
                        If a = 0 Then
                            ActiveSheet.Cells(g + 1, i2).Interior.Color = RGB(128, 128, 128)
                        Else
                            If a = 2 Then
                                ActiveSheet.Cells(h + 1, i2) = ActiveSheet.Cells(g + 2, i2) - ActiveSheet.Cells(g + 1, i2)
                                ActiveSheet.Cells(h + 1, i2).NumberFormatLocal = "[h]时mm分"
                                ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(255, 140, 0)
                            Else
                                ActiveSheet.Cells(g + 1, i2).Interior.Color = RGB(255, 255, 0)
                            End If
                        End If
                    End If
                End If
                
                ' 公司逻辑
                ' If ActiveSheet.Rows(g).Find(what:="公司", lookat:=xlPart) Is Nothing Then
                If ActiveSheet.Cells(g, "u").Value = "公司" Then
                    If ActiveSheet.Cells(g, "k").Value = "黄秀霞" Then
                        If a = 4 Then
                            ActiveSheet.Cells(h + 1, i2) = ActiveSheet.Cells(g + 2, i2) + ActiveSheet.Cells(g + 4, i2) - ActiveSheet.Cells(g + 1, i2) - ActiveSheet.Cells(g + 3, i2)
                            If Hour(ActiveSheet.Cells(h + 1, i2)) * 60 + Minute(ActiveSheet.Cells(h + 1, i2)) < 535 Then
                                ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(255, 0, 0)
                            Else
                                ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(206, 255, 206)
                            End If
                            ActiveSheet.Cells(h + 1, i2).NumberFormatLocal = "[h]时mm分"
                        Else
                            If a = 0 Then
                                ActiveSheet.Cells(g + 1, i2).Interior.Color = RGB(128, 128, 128)
                            Else
                                If a = 2 Then
                                    ActiveSheet.Cells(h + 1, i2) = ActiveSheet.Cells(g + 2, i2) - ActiveSheet.Cells(g + 1, i2)
                                    ActiveSheet.Cells(h + 1, i2).NumberFormatLocal = "[h]时mm分"
                                    ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(255, 140, 0)
                                Else
                                    ActiveSheet.Cells(g + 1, i2).Interior.Color = RGB(255, 255, 0)
                                End If
                            End If
                        End If
                    Else
                        If a = 2 Then
                            ActiveSheet.Cells(h + 1, i2) = ActiveSheet.Cells(g + 2, i2) - ActiveSheet.Cells(g + 1, i2)
                            If Hour(ActiveSheet.Cells(h + 1, i2)) * 60 + Minute(ActiveSheet.Cells(h + 1, i2)) < 535 Then
                                ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(255, 0, 0)
                            Else
                                ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(206, 255, 206)
                            End If
                            ActiveSheet.Cells(h + 1, i2).NumberFormatLocal = "[h]时mm分"
                        ' Else If a = 4 Then
                        '     ActiveSheet.Cells(h + 1, i2) = ActiveSheet.Cells(g + 2, i2) + ActiveSheet.Cells(g + 4, i2) - ActiveSheet.Cells(g + 1, i2) - ActiveSheet.Cells(g + 3, i2)
                        '     If Hour(ActiveSheet.Cells(h + 1, i2)) * 60 + Minute(ActiveSheet.Cells(h + 1, i2)) < 535 Then
                        '         ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(255, 0, 0)
                        '     Else
                        '         ActiveSheet.Cells(h + 1, i2).Interior.Color = RGB(206,255,206)
                        '     End If
                        '     ActiveSheet.Cells(h + 1, i2).NumberFormatLocal = "[h]时mm分"
                        Else
                            If a = 0 Then
                                ActiveSheet.Cells(g + 1, i2).Interior.Color = RGB(128, 128, 128)
                            Else
                                ActiveSheet.Cells(g + 1, i2).Interior.Color = RGB(255, 255, 0)
                            End If
                        End If
                    End If
                End If
                
                h = g
            Next
        End If
    Next
End Sub