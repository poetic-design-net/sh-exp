"use client";

import { useEffect, useState } from "react";
import { Course, CourseContentItem, UserProgress, Chapter } from "types/course";
import { useAuth } from "contexts/auth-context";
import { Button } from "components/ui/button";
import { Progress } from "components/ui/progress";
import { 
  updateUserProgress, 
  checkCertificateEligibility,
  createCertificate 
} from "app/actions/courses";
import { toast } from "components/ui/use-toast";

interface CourseViewProps {
  course: Course;
  initialProgress?: UserProgress;
}

export function CourseView({ course, initialProgress }: CourseViewProps) {
  const { user } = useAuth();
  const [activeChapter, setActiveChapter] = useState<Chapter>(course.chapters[0]);
  const [progress, setProgress] = useState<UserProgress | undefined>(initialProgress);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [isEligibleForCertificate, setIsEligibleForCertificate] = useState(false);

  useEffect(() => {
    if (user && progress) {
      checkCertificateEligibility(user.uid, course.id).then(setIsEligibleForCertificate);
    }
  }, [user, course.id, progress]);

  const calculateProgress = () => {
    if (!progress) return 0;
    const totalItems = course.chapters.reduce(
      (sum, chapter) => sum + chapter.items.length,
      0
    );
    return (progress.completedItems.length / totalItems) * 100;
  };

  const markItemComplete = async (itemId: string, chapterId: string) => {
    if (!user) return;

    const updatedProgress = await updateUserProgress(user.uid, course.id, {
      completedItems: [...(progress?.completedItems || []), itemId],
      completedChapters: 
        isChapterComplete(chapterId) 
          ? [...(progress?.completedChapters || []), chapterId]
          : progress?.completedChapters || [],
    });
    setProgress(updatedProgress);
  };

  const isChapterComplete = (chapterId: string) => {
    const chapter = course.chapters.find(c => c.id === chapterId);
    if (!chapter || !progress) return false;
    
    return chapter.items.every(item => 
      progress.completedItems.includes(item.id)
    );
  };

  const handleQuizSubmit = async (item: CourseContentItem) => {
    if (!user || !item.questions) return;

    const score = item.questions.reduce((total, q, index) => {
      return total + (quizAnswers[`${item.id}-${index}`] === q.correctAnswer ? 1 : 0);
    }, 0);

    const updatedProgress = await updateUserProgress(user.uid, course.id, {
      quizScores: [
        ...(progress?.quizScores || []),
        {
          itemId: item.id,
          score: (score / item.questions.length) * 100,
          completedAt: new Date().toISOString(),
        },
      ],
    });
    setProgress(updatedProgress);
    markItemComplete(item.id, activeChapter.id);
  };

  const handleRequestCertificate = async () => {
    if (!user || !isEligibleForCertificate) return;

    try {
      await createCertificate(
        user.uid,
        course.id,
        user.displayName || "Kursteilnehmer",
        course.title
      );
      toast({
        title: "Zertifikat erstellt",
        description: "Dein Zertifikat wurde erfolgreich erstellt und kann jetzt heruntergeladen werden.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Das Zertifikat konnte nicht erstellt werden. Bitte versuche es später erneut.",
        variant: "destructive",
      });
    }
  };

  const renderContent = (item: CourseContentItem) => {
    const isCompleted = progress?.completedItems.includes(item.id);

    switch (item.type) {
      case "text":
        return (
          <div className="space-y-4">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
            {user && (
              <Button
                onClick={() => markItemComplete(item.id, activeChapter.id)}
                disabled={isCompleted}
              >
                {isCompleted ? "Abgeschlossen" : "Als abgeschlossen markieren"}
              </Button>
            )}
          </div>
        );
      case "video-embed":
        return (
          <div className="space-y-4">
            <div className="aspect-video">
              {item.content.includes("youtube") ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${
                    item.content.includes("watch?v=")
                      ? item.content.split("watch?v=")[1]
                      : item.content
                  }`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : item.content.includes("vimeo") ? (
                <iframe
                  className="w-full h-full"
                  src={`https://player.vimeo.com/video/${
                    item.content.includes("vimeo.com/")
                      ? item.content.split("vimeo.com/")[1]
                      : item.content
                  }`}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  Ungültige Video-URL
                </div>
              )}
            </div>
            {user && (
              <Button
                onClick={() => markItemComplete(item.id, activeChapter.id)}
                disabled={isCompleted}
              >
                {isCompleted ? "Abgeschlossen" : "Als abgeschlossen markieren"}
              </Button>
            )}
          </div>
        );
      case "image-grid":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {item.images?.map((imageUrl, imageIndex) => (
                <div
                  key={imageIndex}
                  className="relative aspect-square rounded-lg overflow-hidden"
                >
                  <img
                    src={imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            {user && (
              <Button
                onClick={() => markItemComplete(item.id, activeChapter.id)}
                disabled={isCompleted}
              >
                {isCompleted ? "Abgeschlossen" : "Als abgeschlossen markieren"}
              </Button>
            )}
          </div>
        );
      case "quiz":
        const quizScore = progress?.quizScores.find(s => s.itemId === item.id);
        
        return (
          <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
            {quizScore ? (
              <div className="text-center">
                <h3 className="font-medium mb-2">Quiz abgeschlossen</h3>
                <p>Dein Ergebnis: {quizScore.score}%</p>
              </div>
            ) : (
              <>
                {item.questions?.map((question, questionIndex) => (
                  <div key={questionIndex} className="space-y-4">
                    <h3 className="font-medium">{question.question}</h3>
                    <div className="space-y-2">
                      {question.answers.map((answer, answerIndex) => (
                        <label
                          key={answerIndex}
                          className="flex items-center gap-2 p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="radio"
                            name={`question-${item.id}-${questionIndex}`}
                            value={answerIndex}
                            onChange={() => 
                              setQuizAnswers(prev => ({
                                ...prev,
                                [`${item.id}-${questionIndex}`]: answerIndex,
                              }))
                            }
                            className="text-primary"
                          />
                          <span>{answer}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <Button 
                  onClick={() => handleQuizSubmit(item)}
                  disabled={!item.questions?.every((_, index) => 
                    quizAnswers[`${item.id}-${index}`] !== undefined
                  )}
                >
                  Quiz abschließen
                </Button>
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-3 space-y-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-4">Kursfortschritt</h2>
            <Progress value={calculateProgress()} className="mb-2" />
            <p className="text-sm text-gray-600">
              {Math.round(calculateProgress())}% abgeschlossen
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-4">Kapitel</h2>
            <div className="space-y-2">
              {course.chapters.map(chapter => (
                <button
                  key={chapter.id}
                  onClick={() => setActiveChapter(chapter)}
                  className={`w-full text-left p-2 rounded ${
                    activeChapter.id === chapter.id
                      ? "bg-primary text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{chapter.title}</span>
                    {isChapterComplete(chapter.id) && (
                      <span className="text-green-500">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {isEligibleForCertificate && (
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-semibold mb-4">Zertifikat</h2>
              <Button
                onClick={handleRequestCertificate}
                className="w-full"
              >
                Zertifikat anfordern
              </Button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="col-span-9">
          <div className="bg-white p-6 rounded-lg shadow">
            <h1 className="text-3xl font-bold mb-6">{course.title}</h1>
            {course.description && (
              <div
                className="prose max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
            )}
            
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold mb-4">
                {activeChapter.title}
              </h2>
              {activeChapter.description && (
                <div
                  className="prose max-w-none mb-6"
                  dangerouslySetInnerHTML={{ __html: activeChapter.description }}
                />
              )}
              {activeChapter.items
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                  <div key={item.id} className="space-y-4">
                    {item.title && (
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                    )}
                    {renderContent(item)}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}