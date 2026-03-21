from rest_framework import serializers
from .models import Quiz, Question, Option, QuizAttempt, StudentAnswer


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Option
        fields = ['id', 'text', 'is_correct']

# For students: hide is_correct
class OptionPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Option
        fields = ['id', 'text']


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True)

    class Meta:
        model  = Question
        fields = ['id', 'text', 'marks', 'order', 'options']

    def create(self, validated_data):
        options_data = validated_data.pop('options')
        question = Question.objects.create(**validated_data)
        for opt in options_data:
            Option.objects.create(question=question, **opt)
        return question


class QuestionPublicSerializer(serializers.ModelSerializer):
    """Strips correct answers for students taking the quiz."""
    options = OptionPublicSerializer(many=True)

    class Meta:
        model  = Question
        fields = ['id', 'text', 'marks', 'order', 'options']


class QuizSerializer(serializers.ModelSerializer):
    questions    = QuestionSerializer(many=True, read_only=True)
    total_marks  = serializers.ReadOnlyField()

    class Meta:
        model  = Quiz
        fields = '__all__'


class QuizPublicSerializer(serializers.ModelSerializer):
    """For students — no answers exposed."""
    questions   = QuestionPublicSerializer(many=True, read_only=True)
    total_marks = serializers.ReadOnlyField()

    class Meta:
        model  = Quiz
        fields = ['id', 'course', 'title', 'description', 'time_limit_minutes', 'total_marks', 'questions']


class StudentAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model  = StudentAnswer
        fields = ['question', 'selected_option']


class QuizAttemptSerializer(serializers.ModelSerializer):
    answers = StudentAnswerSerializer(many=True, read_only=True)
    passed  = serializers.ReadOnlyField()

    class Meta:
        model  = QuizAttempt
        fields = ['id', 'quiz', 'status', 'score', 'passed', 'started_at', 'submitted_at', 'answers']
        read_only_fields = ['status', 'score', 'started_at', 'submitted_at', 'passed']


class SubmitQuizSerializer(serializers.Serializer):
    """Payload: list of {question_id, option_id} answers."""
    answers = StudentAnswerSerializer(many=True)
