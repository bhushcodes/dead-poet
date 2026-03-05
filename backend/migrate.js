const mongoose = require('mongoose');
const Post = require('./models/Post');
require('dotenv').config();

const posts = [
  // Marathi Poems
  {
    title: 'आठवण',
    content: `किती गोड होते ते दिवस,
लहानपणी चे ते सुंदर रहस्य,
मनमोळके करुनि सर्व आपण,
रमत होतो त्या विसरल्या वाऱ्यात,

मन खूप होते चंचळ,
खूप ते निर्मळ,

काळ बदलला, वर्ष निघाली,
आता आठवण करीत दृश्य निघाली,

आठवण येते त्या मौल्य क्षणांची,
 ती आठवणच राहिली या मनातनी.
 
काळ बदलतो, काळच विझवतो,
या दृश्याची व्यथा तोच बघतो.

शेवटी तोच काळ,
त्या क्षणांची तीच सकाळ.`,
    author: 'भूषण',
    category: 'poem',
    language: 'marathi',
    slug: 'aathvan',
    isPublished: true,
    order: 1
  },
  {
    title: 'अनंतता',
    content: `अनंतता म्हणजे काय,
हा प्रश्न पडतो मनात,
काळ अनंत असेल तर,
आपण कुठे असतो?

शून्य अनंत अंधार,
तोच आपला विसर,
काळाची पाळी आली की,
सर्वच विसरून जातो.

पण आठवण अनंत आहे,
तीच खरी अनंतता,
जोपर्यंत मनात जिवंत,
त्या आठवणी आहेत.`,
    author: 'भूषण',
    category: 'poem',
    language: 'marathi',
    slug: 'anantata',
    isPublished: true,
    order: 2
  },
  {
    title: 'मूल्यवत्ता',
    content: `मूल्यवत्ता म्हणजे काय,
हे शब्दात सांगता येत नाही,
जो करेल तोच जाणेल,
हे सत्य निश्चित आहे.

पैसा, कीर्ती, यश,
हे सर्व मिथ्या आहे,
खरं मूल्य तेच आहे,
जो माणूस आपला विसरत नाही.

दया, प्रेम, सेवा,
हेच खरी शान आहे,
जो यांचा त्याग करेल,
तोच खरा माणूस आहे.`,
    author: 'भूषण',
    category: 'poem',
    language: 'hindi',
    slug: 'mulyavatta',
    isPublished: true,
    order: 1
  },
  {
    title: 'निर्णय',
    content: `निर्णय कठीण असतात,
जेव्हा मनात संघर्ष असतो,
काही वेळी आपण जातो,
पण रस्ता चुकतो.

पण निर्णय हवेच असतात,
कुठे तरी पोचायला,
जो थांबेल तोच राहील,
चालणारा पुढे जायला.

काही निर्णय चुका असतात,
पण त्यातूनच शिकतो,
जो कधी चुकत नाही,
तो काहीच करत नाही.`,
    author: 'भूषण',
    category: 'poem',
    language: 'hindi',
    slug: 'nirnay',
    isPublished: true,
    order: 2
  },
  {
    title: 'उलझन',
    content: `उलझन अनंत आहे,
जीवनाचे गुंते,
काळ ही सर्व सोडवते,
पण नवीन उलझन आणते.

काही उलझने स्वतः सोडवतो,
काही मित्रांसोबत,
पण काही उलझने,
फक्त एकटेच सोडवायची असतात.

शेवटी उलझन हेच जीवन आहे,
निस्तरच सरळ नाही कोणाचे,
जो सामना करेल तोच,
पुढे जायला लायक असतो.`,
    author: 'भूषण',
    category: 'poem',
    language: 'hindi',
    slug: 'uljhan',
    isPublished: true,
    order: 3
  },
  {
    title: 'प्रश्न',
    content: `प्रश्न अनेक असतात,
उत्तर कठीण असतात,
काही स्वतःला विचारतो,
काही दुसऱ्याला विचारतो.

जीवन काय आहे?
प्रेम काय आहे?
या प्रश्नांची उत्तरे,
कोणीच देत नाही.

पण प्रश्न विचारत राहणे,
हेच जीवन आहे,
उत्तर शोधत राहणे,
हाच आनंद आहे.`,
    author: 'भूषण',
    category: 'poem',
    language: 'hindi',
    slug: 'prashn',
    isPublished: true,
    order: 4
  },
  {
    title: 'अवशेष',
    content: `अवशेष राहतात,
जेव्हा काही नाहीशी होते,
आठवणी अवशेष आहेत,
तीच खऱ्या असतात.

जीवनात जे येते जाते,
ते सर्व अवशेष घेऊन जाते,
पण काही अवशेष,
मनात सदैव राहतात.

शेवटी सर्वच नाहीशी होते,
फक्त आठवणीच राहतात,
ज्या आठवणी जिवंत असतात,
तेच खरी संपत्ती असतात.`,
    author: 'भूषण',
    category: 'poem',
    language: 'hindi',
    slug: 'avashesha',
    isPublished: true,
    order: 5
  },
  // English Poems
  {
    title: 'Unheard',
    content: `In the silence of the night,
I whisper my thoughts so slight,
But no one hears my silent plea,
In this world so cold and hollow.

Words I speak but no one knows,
Feelings deep that overflow,
Trapped inside this heart of mine,
Yearning for a sign.

Will someone ever hear,
The cries I hold so dear?
Or will I fade away unheard,
Into the darkness of the void?`,
    author: 'Bhushan',
    category: 'poem',
    language: 'english',
    slug: 'unheard',
    isPublished: true,
    order: 1
  },
  {
    title: 'Bound',
    content: `Bound by chains I cannot see,
Trapped in my own fantasy,
The world outside calls to me,
But I'm bound where I cannot be.

Every step I try to take,
Something holds me, makes me break,
Dreams I have, so far away,
Bound to live another day.

When will these chains break free?
When will I finally be,
The person that I'm meant to be,
Unbound and finally free?`,
    author: 'Bhushan',
    category: 'poem',
    language: 'english',
    slug: 'bound',
    isPublished: true,
    order: 2
  },
  {
    title: 'Last Year',
    content: `Last year I thought I knew,
Exactly what I wanted to do,
But life has other plans for me,
Changing everything I see.

The person that I was before,
Is not the person anymore,
I've grown and changed so much,
I've lost and I've found much.

Looking back I see the growth,
The pain, the joy, the both,
Last year taught me so much,
About life and love and such.

Here's to another year,
Full of hope and full of fear,
But I'll face it head on strong,
That's what last year taught me all along.`,
    author: 'Bhushan',
    category: 'poem',
    language: 'english',
    slug: 'last-year',
    isPublished: true,
    order: 3
  },
  // Hindi Story
  {
    title: 'खोया मन',
    content: `राम एक छोटे से गाँव में रहता था। वो हमेशा अपने खेतों में काम करता था और अपने परिवार का पालन करता था।

एक दिन, राम को एक अजीब सा एहसास हुआ। उसे लगा जैसे उसका मन कहीं खो गया है। वो कुछ नहीं सोच पाता था और न ही कुछ कर पाता था।

वो अपने दोस्त से मिला और बोला, "मेरा मन खो गया है।"

दोस्त ने कहा, "तुम्हारा मन तो तुम्हारे अंदर है। बस उसे खोजने की जरूरत है।"

राम ने सोचा और समझा। उसने अपनी आँखें बंद कीं और अपने अंदर देखा। धीरे-धीरे उसे अपना मन मिला।

उस दिन से, राम ने कभी अपना मन नहीं खोया।`,
    author: 'भूषण',
    category: 'story',
    language: 'hindi',
    slug: 'khoya-man',
    isPublished: true,
    order: 1
  },
  // English Stories (Kaalanubhav series)
  {
    title: 'Kaalanubhav - Part 1',
    content: `Life is a beautiful journey, full of ups and downs. Each moment teaches us something new. Let me share my experiences with you.

In this first part, I want to talk about the beginning of my journey. When everything was new and fresh. The world seemed so big and full of possibilities.

I remember those days when I used to dream big. When I believed that anything is possible. Those were the days when I learned to hope.

Every person has their own story to tell. This is the beginning of mine. A story of a young soul trying to find its way in this complex world.

Stay tuned for more parts of this journey...`,
    author: 'Bhushan',
    category: 'story',
    language: 'english',
    slug: 'kaalanubhav-p1',
    isPublished: true,
    order: 1
  },
  {
    title: 'Kaalanubhav - Part 2',
    content: `As time passed, I grew wiser. The dreams remained the same, but my approach changed. I learned that success is not about reaching the destination, but about enjoying the journey.

Part 2 of my journey is about growth and learning. Every failure taught me something valuable. Every success made me humble.

I met many people on the way. Some stayed, some left. But each person taught me something about myself.

The world is full of challenges, but so are the opportunities. It's up to us how we perceive them.

More to come in the next parts...`,
    author: 'Bhushan',
    category: 'story',
    language: 'english',
    slug: 'kaalanubhav-p2',
    isPublished: true,
    order: 2
  },
  {
    title: 'Kaalanubhav - Part 3',
    content: `The third part of my journey was about relationships. The people who stood by me in tough times, the ones who believed in me when I didn't believe in myself.

We often forget that we are not alone in this journey. There are people who care for us, who support us. We need to appreciate them more.

This part is dedicated to all those special people in my life. Without them, I wouldn't be who I am today.

Love and gratitude are the foundations of a meaningful life. Without them, we are just existing, not living.

Continue reading...`,
    author: 'Bhushan',
    category: 'story',
    language: 'english',
    slug: 'kaalanubhav-p3',
    isPublished: true,
    order: 3
  },
  {
    title: 'Kaalanubhav - Part 4',
    content: `Part 4 brings us to the present times. The lessons I've learned, the wisdom I've gained, and the person I've become.

Looking back, I see a path full of memories. Some happy, some sad, but all precious. Each moment shaped me into who I am now.

The future is uncertain, but I'm ready to face it. With courage in my heart and hope in my mind, I move forward.

This journey called life is beautiful. It's not about being perfect, but about being authentic. It's about learning, growing, and sharing.

More experiences await...`,
    author: 'Bhushan',
    category: 'story',
    language: 'english',
    slug: 'kaalanubhav-p4',
    isPublished: true,
    order: 4
  },
  {
    title: 'Kaalanubhav - Part 5',
    content: `In this fifth part, I want to talk about dreams. The dreams that keep us alive, the dreams that push us forward.

Every big achievement started as a dream. Someone somewhere imagined something impossible, and then made it possible.

Don't let anyone tell you that your dreams are too big. The bigger the dream, the greater the achievement.

Dream big, work hard, and never give up. That's the formula for success.

The journey continues...`,
    author: 'Bhushan',
    category: 'story',
    language: 'english',
    slug: 'kaalanubhav-p5',
    isPublished: true,
    order: 5
  },
  {
    title: 'Kaalanubhav - Part 6',
    content: `As we reach the sixth part, I reflect on the importance of self-love and self-care. We often forget to take care of ourselves while taking care of others.

Mental health is as important as physical health. We need to give ourselves permission to rest, to recharge, to be alone sometimes.

This part is a reminder to all of you to love yourselves. To accept yourselves as you are. To be kind to yourselves.

You are enough. You have always been enough.

The journey continues, and so do we...`,
    author: 'Bhushan',
    category: 'story',
    language: 'english',
    slug: 'kaalanubhav-p6',
    isPublished: true,
    order: 6
  }
];

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/deadpoet');
    console.log('Connected to MongoDB');
    
    for (const postData of posts) {
      const existing = await Post.findOne({ slug: postData.slug });
      if (!existing) {
        await Post.create(postData);
        console.log(`Created: ${postData.title}`);
      } else {
        console.log(`Already exists: ${postData.title}`);
      }
    }
    
    console.log('Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  migrate();
}

module.exports = { posts, migrate };
