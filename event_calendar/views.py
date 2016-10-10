from collections import defaultdict
from datetime import datetime
from datetime import timedelta
import copy
import ast

from django.shortcuts import render
from django_ajax.decorators import ajax

from .models import *


def start(request):
    """
    :param request: not used so far
    :return: returns rendered calendar
    """
    return render(request, 'calendar.html')


def generate_repeating_events(repeating_event):
    """
    helper function so the get view won't get so bad
    :param repeating_event: getting an event, most import - weekdays to repeat it and end and beginning
    of the event
    :return: an array of events, based on given repeating event
    """
    event_output = []

    if repeating_event.repeat_type == 'week':
        for day in ast.literal_eval(repeating_event.repeat_rules):
            iteration = get_first_iteration(repeating_event.start, int(day))
            while iteration < repeating_event.end:
                single_output = dict()
                single_output['id'] = repeating_event.id
                single_output['title'] = repeating_event.name
                single_output['type'] = repeating_event.event_type
                single_output['start'] = iteration.strftime('%Y-%m-%dT%H:%M:%S')
                single_output['end'] = iteration.strftime('%Y-%m-%dT%H:%M:%S')
                event_output.append(single_output)
                iteration += timedelta(days=7)
    return event_output


def get_first_iteration(start_date, weekday):
    """
    another helper function so the get view won't get so bad
    :param start_date: date to find first weekday from, basically event start date
    :param weekday: weekday to look for and count later
    :return: a weekday we are looking for
    """

    days_ahead = weekday - start_date.weekday()
    if days_ahead <= 0:
        days_ahead += 7
    return start_date + timedelta(days_ahead)


@ajax
def get(request):
    # FIXME view still needs a lot of concentration
    """
    :param request: Takes a request with 2 dates in post, 1 in the start of the calendar view
    (month, week, day), another at the end. Filters event objects with range of those date by
    Event.start
    :return: returns a json containing an array of found objects
    """
    # getting dates
    view_start = datetime.strptime(request.POST['start'], '%Y-%m-%d')
    view_end = datetime.strptime(request.POST['end'], '%Y-%m-%d')

    # working with normal events first
    events = Event.objects.all().filter(start__gte=view_start, end__lte=view_end)
    output = []
    for event in events:
        single_output = dict()
        single_output['id'] = event.id
        single_output['title'] = event.name
        single_output['type'] = event.event_type
        single_output['start'] = event.start.strftime('%Y-%m-%dT%H:%M:%S')
        if event.end:
            single_output['end'] = event.end.strftime('%Y-%m-%dT%H:%M:%S')

        output.append(single_output)

    # working with repeating events now
    repeating_events = RepeatingEvent.objects.all().filter(start__gte=view_start, end__lte=view_end)
    for repeating_event in repeating_events:
        output.extend(generate_repeating_events(repeating_event))
    for event in output:
        print(event)
    return output

@ajax
def delete(request):
    # TODO Update delete view based on new database schedule and new entity in it
    """
    :param request: deletes an event based on id from
    """
    id_to_delete = request.POST['id']
    event = Event.objects.all().filter(id=id_to_delete).first()
    event.delete()


@ajax
def update(request):
    # TODO Update update(lol) view based on new database schedule and new entity in it
    """
    :param request: Takes a request with 2 dates in post, 1 in the start of the calendar view
    (month, week, day), another at the end, new name and new type from form if they were submitted
    """
    id_to_update = request.POST['id']
    event = Event.objects.all().filter(id=id_to_update).first()
    event.start = datetime.strptime(request.POST['start'], '%Y-%m-%d %H:%M:%S')
    if request.POST['end']:
        event.end = datetime.strptime(request.POST['end'], '%Y-%m-%d %H:%M:%S')
    else:
        event.end = event.start
    event.event_type = request.POST['type']
    event.name = request.POST['title']
    event.save()


@ajax
def add(request):
    """
    :param request: Receives a a post request, processes it's data and creates
    a new instance of Event entity
    """

    if len(request.POST['dow']) <= 2:
        event = Event()
        event.name = request.POST['title']
        event.event_type = request.POST['type']
        event.start = datetime.strptime(request.POST['start'], '%Y-%m-%d %H:%M:%S')
        if request.POST['end']:
            event.end = datetime.strptime(request.POST['end'], '%Y-%m-%d %H:%M:%S')
        else:
            event.end = event.start
        event.save()
    else:
        repeating_event = RepeatingEvent()
        repeating_event.name = request.POST['title']
        repeating_event.event_type = request.POST['type']
        repeating_event.repeat_type = request.POST['repeat_type']
        repeating_event.repeat_rules = str(request.POST['dow'])
        repeating_event.start = datetime.strptime(request.POST['start'], '%Y-%m-%d %H:%M:%S')
        if request.POST['end']:
            repeating_event.end = datetime.strptime(request.POST['end'], '%Y-%m-%d %H:%M:%S')
        else:
            repeating_event.end = repeating_event.start
        repeating_event.save()
