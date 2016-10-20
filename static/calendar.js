$.ajaxSetup({
    beforeSend: function (xhr, settings) {
        function getCookie(name) {
            var cookieValue = null;
            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = jQuery.trim(cookies[i]);
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }

        if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
            // Only send the token to relative URLs i.e. locally.
            xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        }
    }
});

$.datetimepicker.setLocale('ru');

$(document).ready(function () {

    $('#calendar').fullCalendar({
        lang: 'ru',
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,basicWeek,basicDay'
        },
        defaultDate: new Date(),
        navLinks: true,
        editable: true,
        eventLimit: true,
        events: function (start, end, timezone, callback) {
            $.ajax({
                type: 'POST',
                url: '/get/',
                dataType: 'json',
                data: {
                    start: moment(start).format("YYYY-MM-DD"),
                    end: moment(end).format("YYYY-MM-DD")
                },
                success: function (data) {
                    callback(data.content);
                }
            });
        },
        eventRender: function (event, element) {
            if (event.type == "first") {
                element.css('background-color', 'indianred');
            } else if (event.type == "second") {
                element.css('background-color', 'green');
            } else if (event.type == "third") {
                element.css('background-color', 'orange');
            } else if (event.type == "fourth") {
                element.css('background-color', 'blue');
            }
        },
        eventClick: onEventClick
    });

    $('#days').hide();
    $('#labelDays').hide();

    $('#newPeriodStart').hide();
    $('#newPeriodEnd').hide();
    $('#newLabelPeriodEnd').hide();
    $('#newLabelPeriodStart').hide();

    $('#newLabelYearStart').hide();
    $('#newYearStart').hide();
    $('#newLabelYearEnd').hide();
    $('#newYearEnd').hide();

    $('#labelStartDay').hide();
    $('#startDay').hide();
    $('#labelEndDay').hide();
    $('#endDay').hide();
    $('#labelStartTime').hide();
    $('#startTime').hide();
    $('#labelEndTime').hide();
    $('#endTime').hide();

    $('#repeatType').change(function () {
        if ($('#repeatType option:selected').val() == 'week') {
            $('#labelStartDay').show();
            $('#startDay').show();
            $('#labelEndDay').show();
            $('#endDay').show();
            $('#labelStartTime').show();
            $('#startTime').show();
            $('#labelEndTime').show();
            $('#endTime').show();


            $('#labelDays').show();

            $('#newLabelYearStart').hide();
            $('#newYearStart').hide();
            $('#newLabelYearEnd').hide();
            $('#newYearEnd').hide();

            $('#newPeriodStart').hide();
            $('#newPeriodEnd').hide();
            $('#newLabelPeriodEnd').hide();
            $('#newLabelPeriodStart').hide();
        } else if ($('#repeatType option:selected').val() == 'month') {

            $('#newPeriodStart').show();
            $('#newPeriodEnd').show();
            $('#newLabelPeriodEnd').show();
            $('#newLabelPeriodStart').show();

            $('#newLabelYearStart').hide();
            $('#newYearStart').hide();
            $('#newLabelYearEnd').hide();
            $('#newYearEnd').hide();

            $('#labelStartDay').hide();
            $('#startDay').hide();
            $('#labelEndDay').hide();
            $('#endDay').hide();
            $('#labelStartTime').hide();
            $('#startTime').hide();
            $('#labelEndTime').hide();
            $('#endTime').hide();
        } else if ($('#repeatType option:selected').val() == 'year') {

            $('#newLabelYearStart').show();
            $('#newYearStart').show();
            $('#newLabelYearEnd').show();
            $('#newYearEnd').show();

            $('#newPeriodStart').hide();
            $('#newPeriodEnd').hide();
            $('#newLabelPeriodEnd').hide();
            $('#newLabelPeriodStart').hide();


            $('#labelStartDay').hide();
            $('#startDay').hide();
            $('#labelEndDay').hide();
            $('#endDay').hide();
            $('#labelStartTime').hide();
            $('#startTime').hide();
            $('#labelEndTime').hide();
            $('#endTime').hide();
        } else {

            $('#newLabelYearStart').hide();
            $('#newYearStart').hide();
            $('#newLabelYearEnd').hide();
            $('#newYearEnd').hide();
            $('#newPeriodStart').hide();
            $('#newPeriodEnd').hide();
            $('#newLabelPeriodEnd').hide();
            $('#newLabelPeriodStart').hide();

            $('#labelStartDay').hide();
            $('#startDay').hide();
            $('#labelEndDay').hide();
            $('#endDay').hide();
            $('#labelStartTime').hide();
            $('#startTime').hide();
            $('#labelEndTime').hide();
            $('#endTime').hide();
        }
    });
    $('#newEventStart').datetimepicker({
        closeOnTimeSelect: true,
        onShow: function (ct) {
            this.setOptions({
                maxDate: $('#newEventEnd').val() ? $('#newEventEnd').val() : false
            })
        }
    });
    $('#newEventEnd').datetimepicker({
        onShow: function (ct) {
            this.setOptions({
                minDate: $('#newEventStart').val() ? $('#newEventStart').val() : false
            })
        }
    });

    $('#newPeriodStart').datetimepicker({
        timepicker: false,
        onShow: function (ct) {
            this.setOptions({
                maxDate: $('#newPeriodEnd').val() ? $('#newPeriodEnd').val() : false
            })
        }
    });

    $('#newPeriodEnd').datetimepicker({
        timepicker: false,
        onShow: function (ct) {
            this.setOptions({
                minDate: $('#newPeriodStart').datetimepicker('getTime') ? $('#newPeriodStart').datetimepicker('getTime') : false
            })
        }
    });

    $('#startTime').datetimepicker({
        datepicker: false,
        onShow: function (ct) {
            this.setOptions({
                maxTime: $('#endTime').datetimepicker('getTime') ? $('#endTime').datetimepicker('getTime') : false
            })
        }
    });

    $('#endTime').datetimepicker({
        datepicker: false,
        onShow: function (ct) {
            this.setOptions({
                minTime: $('#startTime').val() ? $('#startTime').val() : false
            })
        }
    });


    $('#createEvent').click(function () {

        var dow = [];

        $("#days :selected").each(function (i, selected) {
            dow.push($(selected).val());
        });

        var repeat = new Object();
        repeat.type = $("#repeatType option:selected").val();
        if (repeat.type) {
            if (repeat.type == 'month') {
                repeat.periodStart = moment($('#newPeriodStart').datetimepicker('getValue')).format("YYYY-MM-DD");
                repeat.periodEnd = moment($('#newPeriodEnd').datetimepicker('getValue')).format("YYYY-MM-DD");
            } else if (repeat.type == 'year') {
                repeat.periodStart = $("#newYearStart option:selected").val();
                repeat.periodEnd = $("#newYearEnd option:selected").val();
            } else if(repeat.type == 'week') {
                repeat.periodStart = moment($('#startTime').datetimepicker('getValue')).format("HH:mm:SS");
                repeat.periodEnd = moment($('#endTime').datetimepicker('getValue')).format("HH:mm:SS");
            }
        }

        console.log(repeat);

        $.ajax({
            type: 'POST',
            url: 'add/',
            data: {
                title: $('#newEventTitle').val(),
                type: $("#newEventType option:selected").val(),
                repeat: repeat,
                dow: JSON.stringify(dow),
                start: moment($('#newEventStart').datetimepicker('getValue')).format("YYYY-MM-DD HH:MM:SS"),
                end: moment($('#newEventEnd').datetimepicker('getValue')).format("YYYY-MM-DD HH:MM:SS")
            },
            cache: false,
            success: function (data) {
                $('#calendar').fullCalendar('refetchEvents');
            }.bind(this),
            error: function () {
                console.log("Ошибка при попытке создания")
            }.bind(this)
        });
    });
})
;


var onEventClick = function (event, element) {

    if (event.repeat_type == undefined) {
        $('#labelYearStart').hide();
        $('#yearStart').hide();
        $('#labelYearEnd').hide();
        $('#yearEnd').hide();

        $('#labelPeriodStart').hide();
        $('#labelPeriodEnd').hide();
        $('#d').hide();

        $('#periodStart').hide();
        $('#periodEnd').hide();
    } else if (event.repeat_type == 'week') {

        $('#d').val(event.dow);
        $('#d').show();

        $('#labelYearStart').hide();
        $('#yearStart').hide();
        $('#labelYearEnd').hide();
        $('#yearEnd').hide();
        $('#labelPeriodStart').hide();
        $('#labelPeriodEnd').hide();
        $('#periodStart').hide();
        $('#periodEnd').hide();
    } else if (event.repeat_type == 'month') {
        $('#labelYearStart').hide();
        $('#yearStart').hide();
        $('#labelYearEnd').hide();
        $('#yearEnd').hide();

        $('#labelPeriodStart').hide();
        $('#labelPeriodEnd').hide();
        $('#d').hide();

        $('#periodStart').show();
        $('#periodEnd').show();
    } else if (event.repeat_type == 'year') {
        $('#labelYearStart').show();
        $('#yearStart').show();
        $('#labelYearEnd').show();
        $('#yearEnd').show();
        $('#yearStart').val(event.startYear);
        $('#yearEnd').val(event.endYear);

        $('#labelPeriodStart').hide();
        $('#labelPeriodEnd').hide();
        $('#d').hide();

        $('#periodStart').hide();
        $('#periodEnd').hide();
    }

    $("#eventTitle").val(event.title);

    $('#eventStart').datetimepicker({
        value: event.start.format('YYYY MM DD HH:mm'),
        onShow: function (ct) {
            this.setOptions({
                maxDate: $('#eventEnd').val() ? $('#eventEnd').val() : false
            })
        }
    });

    $('#eventEnd').datetimepicker({
        value: event.end == null ? null : event.end.format('YYYY MM DD HH:mm'),
        onShow: function (ct) {
            this.setOptions({
                minDate: $('#eventStart').val() ? $('#eventStart').val() : false
            })
        }
    });

    $('#periodStart').datetimepicker({
        value: event.periodStart != null ? event.periodStart.format('YYYY MM DD') : null,
        timepicker: false,
        onShow: function (ct) {
            this.setOptions({
                maxDate: $('#periodEnd').val() ? $('#periodEnd').val() : false
            })
        }
    });

    $('#periodEnd').datetimepicker({
        value: event.periodEnd != null ? event.periodEnd.format('YYYY MM DD') : null,
        timepicker: false,
        onShow: function (ct) {
            this.setOptions({
                minDate: $('#periodStart').val() ? $('#periodStart').val() : false
            })
        }
    });

    $("#update").click(function () {

        var dow = [];

        $("#d :selected").each(function (i, selected) {
            dow.push($(selected).val());
        });


        var repeat = new Object();
        repeat.type = event.repeat_type;
        if (event.repeat_type) {
            event.repeat_type == 'week' ? repeat.dow = JSON.stringify(dow) : null;
            if (event.repeat_type == 'month') {
                repeat.periodStart = moment($('#periodStart').datetimepicker('getValue')).format("YYYY-MM-DD");
                repeat.periodEnd = moment($('#periodEnd').datetimepicker('getValue')).format("YYYY-MM-DD");
            } else if (event.repeat_type == 'year') {
                repeat.periodStart = $("#yearStart option:selected").val();
                repeat.periodEnd = $("#yearEnd option:selected").val();
            }
        }

        if ($('#eventStart').datetimepicker('getValue') > $('#eventEnd').datetimepicker('getValue')) {
            alert("Дата начала не может быть больше даты конца");
        } else {

            $.ajax({
                type: 'POST',
                url: 'update/url',
                data: {
                    id: event.id,
                    start: moment($('#eventStart').datetimepicker('getValue')).format("YYYY-MM-DD HH:MM:SS"),
                    end: moment($('#eventEnd').datetimepicker('getValue')).format("YYYY-MM-DD HH:MM:SS"),
                    repeat: repeat,
                    type: $("#eventType option:selected").val(),
                    title: $('#eventTitle').val()
                },
                cache: false,
                success: function (data) {
                    $('#calendar').fullCalendar('refetchEvents');

                }.bind(this),
                error: function () {
                    console.log("Ошибка при попытке обновления")
                }.bind(this)
            });

            $("#myModal").modal('hide');
        }
    });

    $("#delete").click(function () {

        $.ajax({
            type: 'POST',
            url: 'delete/',
            data: {id: event.id},
            cache: false,
            success: function (data) {
                $('#calendar').fullCalendar('refetchEvents');

            }.bind(this),
            error: function () {
                console.log("Ошибка при попытке удаления")
            }.bind(this)
        });

        $("#myModal").modal('hide');
    });

    $("#myModal").modal('show');
    $('#calendar').fullCalendar('updateEvent', event);

};

