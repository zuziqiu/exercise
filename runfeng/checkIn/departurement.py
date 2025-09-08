from tkinter import messagebox
from helper import calculate
from constants import missing_status, ignore_status

def distribute(row_time_group):
    try:
        match row_time_group[1][0]:
            case "点心部":
                return snack(row_time_group)
            case "办公室":
                return office(row_time_group)
            case "后勤部":
                return logistic(row_time_group)
            case "楼面部":
                return lobby(row_time_group)
            case "烧味部":
                return roast_meat(row_time_group)
            case "收银部":
                return cashier(row_time_group)
            case "中厨部":
                return middle_cook(row_time_group)
            case _:
                return None


    except Exception as e:
        messagebox.showerror("distribute_error", f"distribute_error: {e}")

# 点心部
def snack(row_time_group):
    try:
        temp_result = [row_time_group[0][0], row_time_group[1][0], None]
        for group_index, time_group in enumerate(row_time_group[3:]):
            if time_group is None:
                temp_result.append(missing_status)
            elif len(time_group) == 2:
                temp_result.append(calculate(time_group, 510))
            elif len(time_group) == 4:
                temp_result.append(calculate(time_group, 510))
            else:
                temp_result.append(ignore_status)

        return temp_result

    except Exception as e:
        messagebox.showerror("handle_data_error", f"handle_data_error: {e}")

#办公室
def office(row_time_group):
    try:
        temp_result = [row_time_group[0][0], row_time_group[1][0], None]
        for group_index, time_group in enumerate(row_time_group[3:]):
            if time_group is None:
                temp_result.append(missing_status)
            elif len(time_group) == 2:
                temp_result.append(calculate(time_group, 510))
            else:
                temp_result.append(ignore_status)

        return temp_result
    except Exception as e:
        messagebox.showerror("handle_data_error", f"handle_data_error: {e}")

# 后勤部
def logistic(row_time_group):
    try:
        temp_result = [row_time_group[0][0], row_time_group[1][0], None]
        for group_index, time_group in enumerate(row_time_group[3:]):
            if time_group is None:
                temp_result.append(missing_status)
            elif len(time_group) == 2:
                temp_result.append(calculate(time_group, 720))
            elif len(time_group) == 4:
                temp_result.append(calculate(time_group, 510))
            else:
                temp_result.append(ignore_status)

        return temp_result

    except Exception as e:
        messagebox.showerror("logistic_error", f"logistic_error: {e}")

# 楼面部
def lobby(row_time_group):
    try:
        temp_result = [row_time_group[0][0], row_time_group[1][0], None]
        for group_index, time_group in enumerate(row_time_group[3:]):
            if time_group is None:
                temp_result.append(missing_status)
            elif len(time_group) == 2:
                temp_result.append(calculate(time_group, 510))
            elif len(time_group) == 4:
                temp_result.append(calculate(time_group, 510))
            else:
                temp_result.append(ignore_status)

        return temp_result

    except Exception as e:
        messagebox.showerror("handle_data_error", f"handle_data_error: {e}")

# 烧味部
def roast_meat(row_time_group):
    try:
        temp_result = [row_time_group[0][0], row_time_group[1][0], None]
        for group_index, time_group in enumerate(row_time_group[3:]):
            if time_group is None:
                temp_result.append(missing_status)
            elif len(time_group) == 2:
                temp_result.append(calculate(time_group, 510))
            elif len(time_group) == 4:
                temp_result.append(calculate(time_group, 510))
            else:
                temp_result.append(ignore_status)

        return temp_result

    except Exception as e:
        messagebox.showerror("handle_data_error", f"handle_data_error: {e}")

# 收银部
def cashier(row_time_group):
    try:
        temp_result = [row_time_group[0][0], row_time_group[1][0], None]
        for group_index, time_group in enumerate(row_time_group[3:]):
            if time_group is None:
                temp_result.append(missing_status)
            elif len(time_group) == 2:
                temp_result.append(calculate(time_group, 510))
            elif len(time_group) == 4:
                temp_result.append(calculate(time_group, 510))
            else:
                temp_result.append(ignore_status)

        return temp_result

    except Exception as e:
        messagebox.showerror("handle_data_error", f"handle_data_error: {e}")

# 中厨部
def middle_cook(row_time_group):
    try:
        temp_result = [row_time_group[0][0], row_time_group[1][0], None]
        for group_index, time_group in enumerate(row_time_group[3:]):
            if time_group is None:
                temp_result.append(missing_status)
            elif len(time_group) == 2:
                temp_result.append(calculate(time_group, 510))
            elif len(time_group) == 4:
                temp_result.append(calculate(time_group, 540))
            else:
                temp_result.append(ignore_status)

        return temp_result

    except Exception as e:
        messagebox.showerror("handle_data_error", f"handle_data_error: {e}")