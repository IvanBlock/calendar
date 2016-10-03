from django.db import models

# Create your models here.

class Event(models.Model):
    name = models.CharField(max_length=60, verbose_name='Название события')
    event_type = models.CharField(max_length=20, verbose_name='Тип события')
    start = models.DateTimeField(verbose_name='Начало события')
    end = models.DateTimeField(null=True, blank=True, verbose_name="Конец события")
