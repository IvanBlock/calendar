from datetime import datetime

from django.shortcuts import render
from django_ajax.decorators import ajax
from .models import Event


def start(request):
    """
    :param request: not used so far
    :return: returns rendered calendar
    """
    return render(request, 'calendar.html')

@ajax
def get(request):
    """
    :param request: Takes a request with 2 dates in post, 1 in the start of the calendar view
    (month, week, day), another at the end. Filters event objects with range of those date by
    Event.start
    :return: returns a json containing an array of found objects
    """
    view_start = datetime.strptime(request.POST['start'], '%Y-%m-%d')
    view_end = datetime.strptime(request.POST['end'], '%Y-%m-%d')
    events = Event.objects.all().filter(start__gte=view_start)
    output = []
    for event in events:
        single_output = {}
        single_output['id'] = event.id
        single_output['title'] = event.name
        single_output['type'] = event.event_type
        single_output['start'] = event.start.strftime('%Y-%m-%dT%H:%M:%S')
        if event.end:
            single_output['end'] = event.end.strftime('%Y-%m-%dT%H:%M:%S')
        output.append(single_output)
    return output


@ajax
def delete(request):
    id_to_delete = request.POST['id']
    event = Event.objects.all().filter(id=id_to_delete).first()
    event.delete()



@ajax
def update(request):
    id_to_update = request.POST['id']
    event = Event.objects.all().filter(id=id_to_update).first()
    event.start = datetime.strptime(request.POST['start'], '%Y-%m-%d %H:%M:%S')
    event.end = datetime.strptime(request.POST['end'], '%Y-%m-%d %H:%M:%S')
    event.event_type  = request.POST['type']
    event.name = request.POST['title']
    event.save()


@ajax
def add(request):
    """
    :param request: Receives a a post request, processes it's data and creates
    a new instance of Event entity
    """
    event = Event()
    event.name = request.POST['title']
    event.event_type = request.POST['type']
    event.start = datetime.strptime(request.POST['start'], '%Y-%m-%d %H:%M:%S')
    if request.POST['end']:
        event.end = datetime.strptime(request.POST['end'], '%Y-%m-%d %H:%M:%S')
    else:
        event.end = event.start
    event.save()
